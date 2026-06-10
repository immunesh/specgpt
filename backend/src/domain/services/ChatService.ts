import { v4 as uuidv4 } from 'uuid'
import { Response } from 'express'
import { conversationRepository, analyticsRepository } from '@/core/container'
import { fiveGGuard } from '@/core/ai/FiveGGuard'
import { ragRetriever } from '@/core/ai/RagRetriever'
import { promptBuilder } from '@/core/ai/PromptBuilder'
import { claudeService } from '@/core/ai/ClaudeService'
import { config } from '@/config'
import { logger } from '@/utils/logger'
import { NotFoundError } from '@/utils/errors'
import { Message } from '@prisma/client'
import { SourceReference } from '@/types/shared'

export interface ChatInput {
  userId: string
  conversationId?: string
  message: string
}

export interface ChatResult {
  conversationId: string
  messageId: string
  content: string
  sources: SourceReference[]
  inputTokens: number
  outputTokens: number
  latencyMs: number
}

export class ChatService {
  // Non-streaming chat
  async chat(input: ChatInput): Promise<ChatResult> {
    const start = Date.now()

    // 1. Domain guard
    const guard = await fiveGGuard.check(input.message)
    if (!guard.allowed) {
      const rejectionContent = promptBuilder.buildRejectionMessage(guard.reason)
      const convId = await this.ensureConversation(input.userId, input.conversationId, input.message)

      const [userMsg, assistantMsg] = await Promise.all([
        conversationRepository.createMessage({
          conversationId: convId,
          role: 'user',
          content: input.message,
        }),
        conversationRepository.createMessage({
          conversationId: convId,
          role: 'assistant',
          content: rejectionContent,
          isFiltered: true,
          filterReason: 'non_5g_query',
        }),
      ])

      return {
        conversationId: convId,
        messageId: assistantMsg.id,
        content: rejectionContent,
        sources: [],
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: Date.now() - start,
      }
    }

    // 2. Ensure conversation exists
    const conversationId = await this.ensureConversation(
      input.userId,
      input.conversationId,
      input.message,
    )

    // 3. Save user message
    await conversationRepository.createMessage({
      conversationId,
      role: 'user',
      content: input.message,
    })

    // 4. Get conversation history for context
    const history = await conversationRepository.getMessages(conversationId, input.userId, 20)
    const priorHistory = history.slice(0, -1) // exclude the message we just added

    // 5. RAG retrieval (graceful fallback — chat works even without embeddings)
    const { contextText, sources } = await ragRetriever.retrieve(input.message).catch(() => ({ contextText: '', sources: [] as SourceReference[] }))

    // 6. Build prompt
    const prompt = promptBuilder.build(input.message, contextText, priorHistory)

    // 7. Claude API
    const result = await claudeService.complete(prompt)

    // 8. Save assistant message
    const assistantMsg = await conversationRepository.createMessage({
      conversationId,
      role: 'assistant',
      content: result.content,
      sources: sources as object[],
      tokenCount: result.inputTokens + result.outputTokens,
      modelUsed: config.groq.model,
      latencyMs: result.latencyMs,
    })

    // 9. Record usage
    await analyticsRepository.recordApiUsage({
      userId: input.userId,
      conversationId,
      model: config.groq.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      latencyMs: result.latencyMs,
      isStreamed: false,
    })

    logger.info('Chat complete', {
      userId: input.userId,
      conversationId,
      tokens: result.inputTokens + result.outputTokens,
      sources: sources.length,
    })

    return {
      conversationId,
      messageId: assistantMsg.id,
      content: result.content,
      sources,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      latencyMs: result.latencyMs,
    }
  }

  // Streaming chat — writes SSE directly to Express res
  async chatStream(input: ChatInput, res: Response): Promise<void> {
    const start = Date.now()
    const messageId = uuidv4()

    // 1. Domain guard
    const guard = await fiveGGuard.check(input.message)

    if (!guard.allowed) {
      const convId = await this.ensureConversation(input.userId, input.conversationId, input.message)
      const rejectionContent = promptBuilder.buildRejectionMessage(guard.reason)

      this.writeSSE(res, { type: 'start', conversationId: convId, messageId })
      this.writeSSE(res, { type: 'delta', content: rejectionContent })
      this.writeSSE(res, { type: 'end', totalTokens: 0 })
      res.write('data: [DONE]\n\n')
      res.end()

      await Promise.all([
        conversationRepository.createMessage({ conversationId: convId, role: 'user', content: input.message }),
        conversationRepository.createMessage({ conversationId: convId, role: 'assistant', content: rejectionContent, isFiltered: true, filterReason: 'non_5g_query' }),
      ])
      return
    }

    // 2. Ensure conversation
    const conversationId = await this.ensureConversation(input.userId, input.conversationId, input.message)

    // 3. Save user message
    await conversationRepository.createMessage({ conversationId, role: 'user', content: input.message })

    // 4. Parallel: history + RAG retrieval (graceful fallback — chat works even without embeddings)
    const [history, ragResult] = await Promise.all([
      conversationRepository.getMessages(conversationId, input.userId, 20),
      ragRetriever.retrieve(input.message).catch(() => ({ contextText: '', sources: [] as SourceReference[] })),
    ])

    const priorHistory = history.slice(0, -1)
    const { contextText, sources } = ragResult

    // 5. Build prompt
    const prompt = promptBuilder.build(input.message, contextText, priorHistory)

    // 6. Stream response
    const result = await claudeService.streamToSSE(prompt, res, sources, conversationId, messageId)

    // 7. Persist assistant message + analytics (after stream ends)
    await Promise.all([
      conversationRepository.createMessage({
        conversationId,
        role: 'assistant',
        content: result.content,
        sources: sources as object[],
        tokenCount: result.inputTokens + result.outputTokens,
        modelUsed: config.groq.model,
        latencyMs: result.latencyMs,
      }),
      analyticsRepository.recordApiUsage({
        userId: input.userId,
        conversationId,
        model: config.groq.model,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
        isStreamed: true,
      }),
    ])
  }

  private async ensureConversation(
    userId: string,
    conversationId: string | undefined,
    firstMessage: string,
  ): Promise<string> {
    if (conversationId) {
      const existing = await conversationRepository.findById(conversationId, userId)
      if (!existing) throw new NotFoundError('Conversation')
      return conversationId
    }

    // Auto-title from first message (first 60 chars)
    const title = firstMessage.length > 60
      ? firstMessage.slice(0, 57) + '...'
      : firstMessage

    const conv = await conversationRepository.create({ userId, title })
    return conv.id
  }

  private writeSSE(res: Response, data: object): void {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
    if (typeof (res as Response & { flush?: () => void }).flush === 'function') {
      (res as Response & { flush: () => void }).flush()
    }
  }
}

export const chatService = new ChatService()
