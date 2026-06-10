import path from 'path'
import { Document, DocumentStatus, Release, SpecSeries } from '@prisma/client'
import { documentRepository } from '@/core/container'
import { documentQueue, redisAvailable } from '@/infrastructure/queue/documentQueue'
import { documentProcessor } from '@/core/rag/DocumentProcessor'
import { fileStorageService } from '@/infrastructure/storage/FileStorageService'
import { logger } from '@/utils/logger'
import { NotFoundError, ValidationError } from '@/utils/errors'
import { config } from '@/config'

export interface UploadDocumentDto {
  file: Express.Multer.File
  userId: string
  specNumber?: string
  specTitle?: string
  series?: SpecSeries
  release?: Release
}

export class DocumentService {
  async upload(dto: UploadDocumentDto): Promise<Document> {
    const { file, userId } = dto

    // Build the full file path (multer puts file in upload dir)
    const filePath = path.join(path.resolve(config.upload.dir), file.filename)

    // Create document record
    const document = await documentRepository.create({
      name: dto.specTitle ?? file.originalname.replace('.pdf', ''),
      fileName: file.originalname,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      specNumber: dto.specNumber,
      specTitle: dto.specTitle,
      series: dto.series,
      release: dto.release,
      uploadedBy: userId,
    })

    // Process directly if Redis unavailable, otherwise enqueue
    if (redisAvailable) {
      await documentQueue.add(
        { documentId: document.id, filePath, userId },
        { jobId: document.id },
      )
      logger.info('Document queued for processing', { documentId: document.id })
    } else {
      logger.info('Redis unavailable — processing document directly', { documentId: document.id })
      documentProcessor.process(document.id, filePath).catch((err) =>
        logger.error('Direct document processing failed', { documentId: document.id, error: err.message }),
      )
    }

    return document
  }

  async list(params: {
    page: number
    limit: number
    status?: DocumentStatus
    series?: SpecSeries
    release?: Release
    search?: string
  }): Promise<{ documents: Document[]; total: number; totalPages: number }> {
    const { documents, total } = await documentRepository.findMany(params)
    return {
      documents,
      total,
      totalPages: Math.ceil(total / params.limit),
    }
  }

  async getById(id: string): Promise<Document> {
    const doc = await documentRepository.findById(id)
    if (!doc) throw new NotFoundError('Document')
    return doc
  }

  async delete(id: string): Promise<void> {
    const doc = await documentRepository.findById(id)
    if (!doc) throw new NotFoundError('Document')

    if (doc.status === DocumentStatus.PROCESSING) {
      throw new ValidationError('Cannot delete a document currently being processed')
    }

    // Remove chunks + vectors from DB (cascade on delete)
    await documentRepository.deleteChunks(id)

    // Remove file from disk
    if (doc.filePath) {
      await fileStorageService.deleteFile(doc.filePath)
    }

    await documentRepository.delete(id)
  }

  async reprocess(id: string, userId: string): Promise<Document> {
    const doc = await documentRepository.findById(id)
    if (!doc) throw new NotFoundError('Document')
    if (doc.status === DocumentStatus.PROCESSING) {
      throw new ValidationError('Document is already being processed')
    }

    // Clear existing chunks
    await documentRepository.deleteChunks(id)
    await documentRepository.updateStatus(id, DocumentStatus.PENDING)

    if (redisAvailable) {
      await documentQueue.add(
        { documentId: id, filePath: doc.filePath, userId },
        { jobId: `${id}-reprocess-${Date.now()}` },
      )
    } else {
      documentProcessor.process(id, doc.filePath).catch((err) =>
        logger.error('Direct document reprocessing failed', { documentId: id, error: err.message }),
      )
    }

    return documentRepository.findById(id) as Promise<Document>
  }

  async getJobStatus(documentId: string): Promise<{
    status: string
    progress: number
  }> {
    const job = await documentQueue.getJob(documentId)
    if (!job) {
      const doc = await documentRepository.findById(documentId)
      return { status: doc?.status ?? 'NOT_FOUND', progress: doc?.status === DocumentStatus.READY ? 100 : 0 }
    }

    const state = await job.getState()
    const progress = typeof job.progress === 'function'
      ? await (job.progress as () => Promise<number>)()
      : (job.progress as unknown as number) ?? 0

    return { status: state.toUpperCase(), progress: Number(progress) }
  }
}

export const documentService = new DocumentService()
