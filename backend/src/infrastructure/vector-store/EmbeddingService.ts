import { config } from '@/config'
import { logger } from '@/utils/logger'
import { AppError } from '@/utils/errors'

export interface EmbeddingResult {
  embedding: number[]
  tokenCount: number
}

export interface BatchEmbeddingResult {
  embeddings: number[][]
  totalTokens: number
}

// Voyage AI response shape
interface VoyageResponse {
  data: Array<{ embedding: number[]; index: number }>
  usage: { total_tokens: number }
}

// OpenAI embeddings response shape
interface OpenAIResponse {
  data: Array<{ embedding: number[]; index: number }>
  usage: { total_tokens: number; prompt_tokens: number }
}

export class EmbeddingService {
  private readonly maxBatchSize = 32 // Voyage AI limit per request
  private readonly maxTextLength = 16_000 // chars (~4k tokens)

  async embedText(text: string): Promise<EmbeddingResult> {
    const results = await this.embedBatch([text])
    return {
      embedding: results.embeddings[0],
      tokenCount: results.totalTokens,
    }
  }

  async embedBatch(texts: string[]): Promise<BatchEmbeddingResult> {
    const truncated = texts.map((t) => t.slice(0, this.maxTextLength))

    if (config.embedding.provider === 'openai') {
      return this.embedWithOpenAI(truncated)
    }
    return this.embedWithVoyage(truncated)
  }

  // Process large batches with automatic chunking
  async embedBatchLarge(texts: string[]): Promise<number[][]> {
    const allEmbeddings: number[][] = []

    for (let i = 0; i < texts.length; i += this.maxBatchSize) {
      const batch = texts.slice(i, i + this.maxBatchSize)
      const result = await this.embedBatch(batch)
      allEmbeddings.push(...result.embeddings)

      // Brief pause to respect rate limits
      if (i + this.maxBatchSize < texts.length) {
        await this.sleep(200)
      }
    }

    return allEmbeddings
  }

  private async embedWithVoyage(texts: string[]): Promise<BatchEmbeddingResult> {
    if (!config.embedding.voyageApiKey) {
      throw new AppError('VOYAGE_API_KEY not configured', 500, 'EMBEDDING_CONFIG_ERROR')
    }

    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.embedding.voyageApiKey}`,
      },
      body: JSON.stringify({
        input: texts,
        model: config.embedding.model,
        input_type: 'document',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error('Voyage AI embedding error', { status: response.status, error })
      throw new AppError(`Embedding API error: ${response.status}`, 502, 'EMBEDDING_API_ERROR')
    }

    const data = (await response.json()) as VoyageResponse
    return {
      embeddings: data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding),
      totalTokens: data.usage.total_tokens,
    }
  }

  private async embedWithOpenAI(texts: string[]): Promise<BatchEmbeddingResult> {
    if (!config.embedding.openaiApiKey) {
      throw new AppError('OPENAI_API_KEY not configured', 500, 'EMBEDDING_CONFIG_ERROR')
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.embedding.openaiApiKey}`,
      },
      body: JSON.stringify({
        input: texts,
        model: config.embedding.model,
        encoding_format: 'float',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error('OpenAI embedding error', { status: response.status, error })
      throw new AppError(`Embedding API error: ${response.status}`, 502, 'EMBEDDING_API_ERROR')
    }

    const data = (await response.json()) as OpenAIResponse
    return {
      embeddings: data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding),
      totalTokens: data.usage.total_tokens,
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const embeddingService = new EmbeddingService()
