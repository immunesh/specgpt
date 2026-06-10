import { documentRepository } from '@/core/container'
import { SourceReference } from '@/types/shared'
import { logger } from '@/utils/logger'
import { prisma } from '@/infrastructure/database/client'

export interface RetrievedContext {
  contextText: string
  sources: SourceReference[]
  tokenEstimate: number
}

const MAX_CONTEXT_TOKENS = 6000
const CHARS_PER_TOKEN = 4

export class RagRetriever {
  async retrieve(query: string, topK = 6): Promise<RetrievedContext> {
    try {
      // Extract keywords from query (remove common stop words)
      const stopWords = new Set(['what', 'is', 'the', 'a', 'an', 'in', 'of', 'for', 'and', 'or', 'how', 'does', 'do', 'can', 'are', 'was', 'be', 'to', 'it', 'that', 'this', 'with'])
      const keywords = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w))

      if (keywords.length === 0) {
        return { contextText: '', sources: [], tokenEstimate: 0 }
      }

      // Search chunks using PostgreSQL full-text / ILIKE keyword search
      const conditions = keywords.slice(0, 5).map((kw) => ({
        content: { contains: kw, mode: 'insensitive' as const },
      }))

      const chunks = await prisma.documentChunk.findMany({
        where: {
          document: { status: 'READY' },
          OR: conditions,
        },
        include: { document: true },
        take: topK * 3,
      })

      if (chunks.length === 0) {
        return { contextText: '', sources: [], tokenEstimate: 0 }
      }

      // Score each chunk by how many keywords it contains
      const scored = chunks.map((chunk) => {
        const text = chunk.content.toLowerCase()
        const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0)
        return { chunk, score }
      })

      scored.sort((a, b) => b.score - a.score)
      const top = scored.slice(0, topK)

      // Deduplicate by contentHash
      const seen = new Set<string>()
      const unique = top.filter(({ chunk }) => {
        if (seen.has(chunk.contentHash)) return false
        seen.add(chunk.contentHash)
        return true
      })

      const parts: string[] = []
      const sources: SourceReference[] = []
      let totalChars = 0

      for (const { chunk, score } of unique) {
        if (totalChars + chunk.content.length > MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN) break

        const doc = chunk.document
        const specRef = [doc.specNumber, doc.release?.replace('REL_', 'Rel-')].filter(Boolean).join(' ')
        const sectionRef = chunk.section ? `§${chunk.section}` : ''
        const header = [specRef, sectionRef].filter(Boolean).join(' — ')

        const block = [`[SOURCE: ${header || doc.name}]`, chunk.content, ''].join('\n')
        parts.push(block)
        totalChars += block.length

        sources.push({
          documentId: doc.id,
          documentName: doc.name,
          specNumber: doc.specNumber ?? undefined,
          release: doc.release ?? undefined,
          section: chunk.section ?? undefined,
          pageNumber: chunk.pageStart ?? undefined,
          relevanceScore: Math.round((score / keywords.length) * 100) / 100,
          excerpt: chunk.content.slice(0, 300),
        })
      }

      const contextText = parts.join('\n')

      logger.debug('RAG keyword search', {
        query: query.slice(0, 60),
        keywords,
        chunks: unique.length,
      })

      return {
        contextText,
        sources,
        tokenEstimate: Math.ceil(contextText.length / CHARS_PER_TOKEN),
      }
    } catch (err) {
      logger.error('RAG retrieval failed', { error: (err as Error).message })
      return { contextText: '', sources: [], tokenEstimate: 0 }
    }
  }
}

export const ragRetriever = new RagRetriever()
