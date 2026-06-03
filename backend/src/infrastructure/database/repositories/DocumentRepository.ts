import { Document, DocumentChunk, DocumentStatus, Release, SpecSeries } from '@prisma/client'
import { prisma } from '../client'
import {
  IDocumentRepository,
  CreateDocumentDto,
  CreateChunkDto,
  VectorSearchResult,
} from '@/domain/repositories/IDocumentRepository'

export class DocumentRepository implements IDocumentRepository {
  async findById(id: string): Promise<Document | null> {
    return prisma.document.findUnique({ where: { id } })
  }

  async findMany(params: {
    page: number
    limit: number
    status?: DocumentStatus
    series?: SpecSeries
    release?: Release
    search?: string
  }): Promise<{ documents: Document[]; total: number }> {
    const { page, limit, status, series, release, search } = params
    const skip = (page - 1) * limit

    const where = {
      ...(status && { status }),
      ...(series && { series }),
      ...(release && { release }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { specNumber: { contains: search, mode: 'insensitive' as const } },
          { specTitle: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [documents, total] = await prisma.$transaction([
      prisma.document.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.document.count({ where }),
    ])

    return { documents, total }
  }

  async create(data: CreateDocumentDto): Promise<Document> {
    return prisma.document.create({
      data: {
        name: data.name,
        fileName: data.fileName,
        filePath: data.filePath,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        specNumber: data.specNumber,
        specTitle: data.specTitle,
        series: data.series,
        release: data.release,
        uploadedBy: data.uploadedBy,
      },
    })
  }

  async updateStatus(
    id: string,
    status: DocumentStatus,
    errorMessage?: string,
  ): Promise<Document> {
    return prisma.document.update({
      where: { id },
      data: {
        status,
        errorMessage,
        ...(status === DocumentStatus.READY && { processedAt: new Date() }),
      },
    })
  }

  async updateMetadata(
    id: string,
    data: {
      specNumber?: string
      specTitle?: string
      series?: SpecSeries
      release?: Release
      version?: string
      totalPages?: number
      chunkCount?: number
      processedAt?: Date
    },
  ): Promise<Document> {
    return prisma.document.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.document.delete({ where: { id } })
  }

  async createChunks(chunks: CreateChunkDto[]): Promise<void> {
    await prisma.documentChunk.createMany({
      data: chunks.map((c) => ({
        documentId: c.documentId,
        chunkIndex: c.chunkIndex,
        content: c.content,
        contentHash: c.contentHash,
        pageStart: c.pageStart,
        pageEnd: c.pageEnd,
        section: c.section,
        tokenCount: c.tokenCount,
      })),
      skipDuplicates: true,
    })
  }

  async setEmbedding(chunkId: string, embedding: number[]): Promise<void> {
    // pgvector requires raw SQL for vector operations
    const vectorStr = `[${embedding.join(',')}]`
    await prisma.$executeRaw`
      UPDATE document_chunks
      SET embedding = ${vectorStr}::vector
      WHERE id = ${chunkId}::uuid
    `
  }

  async vectorSearch(params: {
    embedding: number[]
    limit?: number
    documentIds?: string[]
  }): Promise<VectorSearchResult[]> {
    const { embedding, limit = 5, documentIds } = params
    const vectorStr = `[${embedding.join(',')}]`
    const limitVal = Math.min(limit, 20)

    type RawResult = {
      id: string
      document_id: string
      chunk_index: number
      content: string
      content_hash: string
      page_start: number | null
      page_end: number | null
      section: string | null
      token_count: number | null
      created_at: Date
      similarity: number
      doc_id: string
      doc_name: string
      doc_spec_number: string | null
      doc_series: string | null
      doc_release: string | null
    }

    let rows: RawResult[]

    if (documentIds && documentIds.length > 0) {
      rows = await prisma.$queryRaw<RawResult[]>`
        SELECT
          dc.id, dc.document_id, dc.chunk_index, dc.content, dc.content_hash,
          dc.page_start, dc.page_end, dc.section, dc.token_count, dc.created_at,
          1 - (dc.embedding <=> ${vectorStr}::vector) AS similarity,
          d.id AS doc_id, d.name AS doc_name,
          d.spec_number AS doc_spec_number,
          d.series AS doc_series, d.release AS doc_release
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        WHERE dc.embedding IS NOT NULL
          AND dc.document_id = ANY(${documentIds}::uuid[])
          AND d.status = 'READY'
        ORDER BY dc.embedding <=> ${vectorStr}::vector
        LIMIT ${limitVal}
      `
    } else {
      rows = await prisma.$queryRaw<RawResult[]>`
        SELECT
          dc.id, dc.document_id, dc.chunk_index, dc.content, dc.content_hash,
          dc.page_start, dc.page_end, dc.section, dc.token_count, dc.created_at,
          1 - (dc.embedding <=> ${vectorStr}::vector) AS similarity,
          d.id AS doc_id, d.name AS doc_name,
          d.spec_number AS doc_spec_number,
          d.series AS doc_series, d.release AS doc_release
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        WHERE dc.embedding IS NOT NULL
          AND d.status = 'READY'
        ORDER BY dc.embedding <=> ${vectorStr}::vector
        LIMIT ${limitVal}
      `
    }

    return rows.map((row) => ({
      chunk: {
        id: row.id,
        documentId: row.document_id,
        chunkIndex: row.chunk_index,
        content: row.content,
        contentHash: row.content_hash,
        embedding: null,
        pageStart: row.page_start,
        pageEnd: row.page_end,
        section: row.section,
        tokenCount: row.token_count,
        createdAt: row.created_at,
        document: {
          id: row.doc_id,
          name: row.doc_name,
          specNumber: row.doc_spec_number,
          series: row.doc_series as SpecSeries | null,
          release: row.doc_release as Release | null,
        } as Document,
      } as DocumentChunk & { document: Document },
      similarity: Number(row.similarity),
    }))
  }

  async deleteChunks(documentId: string): Promise<void> {
    await prisma.documentChunk.deleteMany({ where: { documentId } })
  }
}
