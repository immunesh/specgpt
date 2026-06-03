import { embeddingService } from '@/infrastructure/vector-store/EmbeddingService'
import { documentRepository } from '@/core/container'
import { SourceReference } from '@5g-specgpt/shared'
import { logger } from '@/utils/logger'

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
      // 1. Embed the query
      const { embedding } = await embeddingService.embedText(query)

      // 2. Vector search
      const results = await documentRepository.vectorSearch({
        embedding,
        limit: topK,
      })

      if (results.length === 0) {
        return { contextText: '', sources: [], tokenEstimate: 0 }
      }

      // 3. Deduplicate by contentHash (same text, different docs)
      const seen = new Set<string>()
      const unique = results.filter((r) => {
        if (seen.has(r.chunk.contentHash)) return false
        seen.add(r.chunk.contentHash)
        return true
      })

      // 4. Build context text with section headers + spec refs
      const parts: string[] = []
      const sources: SourceReference[] = []
      let totalChars = 0

      for (const result of unique) {
        const { chunk, similarity } = result
        const doc = chunk.document

        // Stop if we'd exceed context budget
        if (totalChars + chunk.content.length > MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN) break

        const specRef = [doc.specNumber, doc.release?.replace('REL_', 'Rel-')].filter(Boolean).join(' ')
        const sectionRef = chunk.section ? `§${chunk.section}` : ''
        const header = [specRef, sectionRef].filter(Boolean).join(' — ')

        const block = [
          `[SOURCE: ${header || doc.name}]`,
          chunk.content,
          '',
        ].join('\n')

        parts.push(block)
        totalChars += block.length

        sources.push({
          documentId: doc.id,
          documentName: doc.name,
          specNumber: doc.specNumber ?? undefined,
          release: doc.release ?? undefined,
          section: chunk.section ?? undefined,
          pageNumber: chunk.pageStart ?? undefined,
          relevanceScore: Math.round(similarity * 100) / 100,
          excerpt: chunk.content.slice(0, 300),
        })
      }

      const contextText = parts.join('\n')

      logger.debug('RAG context assembled', {
        query: query.slice(0, 60),
        chunks: unique.length,
        chars: contextText.length,
        topScore: unique[0]?.similarity,
      })

      return {
        contextText,
        sources,
        tokenEstimate: Math.ceil(contextText.length / CHARS_PER_TOKEN),
      }
    } catch (err) {
      logger.error('RAG retrieval failed', { error: (err as Error).message })
      // Return empty context — Claude will answer from training knowledge only
      return { contextText: '', sources: [], tokenEstimate: 0 }
    }
  }
}

export const ragRetriever = new RagRetriever()
