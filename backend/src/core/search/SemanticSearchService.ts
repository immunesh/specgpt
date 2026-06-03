import { embeddingService } from '@/infrastructure/vector-store/EmbeddingService'
import { documentRepository } from '@/core/container'
import { VectorSearchResult } from '@/domain/repositories/IDocumentRepository'
import { logger } from '@/utils/logger'

export interface SearchResult {
  documentId: string
  documentName: string
  specNumber?: string | null
  release?: string | null
  series?: string | null
  section?: string | null
  pageNumber?: number | null
  excerpt: string
  relevanceScore: number
  chunkId: string
}

export interface SearchOptions {
  query: string
  limit?: number
  minScore?: number
  documentIds?: string[]
}

export class SemanticSearchService {
  async search(opts: SearchOptions): Promise<SearchResult[]> {
    const { query, limit = 10, minScore = 0.3, documentIds } = opts

    try {
      const { embedding } = await embeddingService.embedText(query)

      const results = await documentRepository.vectorSearch({
        embedding,
        limit: Math.min(limit, 20),
        documentIds,
      })

      return results
        .filter((r) => r.similarity >= minScore)
        .map((r) => ({
          chunkId: r.chunk.id,
          documentId: r.chunk.document.id,
          documentName: r.chunk.document.name,
          specNumber: r.chunk.document.specNumber,
          release: r.chunk.document.release,
          series: r.chunk.document.series,
          section: r.chunk.section,
          pageNumber: r.chunk.pageStart,
          excerpt: r.chunk.content.slice(0, 500),
          relevanceScore: Math.round(r.similarity * 100) / 100,
        }))
    } catch (err) {
      logger.error('Semantic search failed', { error: (err as Error).message })
      return []
    }
  }
}

export const semanticSearchService = new SemanticSearchService()
