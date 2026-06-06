import Groq from 'groq-sdk'
import { config } from '@/config'
import { logger } from '@/utils/logger'
import { BuiltPrompt } from './PromptBuilder'
import { SourceReference } from '@/types/shared'
import { Response } from 'express'

export interface ChatCompletionResult {
  content: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
}

export class ClaudeService {
  private client: Groq

  constructor() {
    this.client = new Groq({ apiKey: config.groq.apiKey })
  }

  async complete(prompt: BuiltPrompt): Promise<ChatCompletionResult> {
    const start = Date.now()

    const response = await this.client.chat.completions.create({
      model: config.groq.model,
      max_tokens: config.anthropic.maxTokens,
      messages: [
        { role: 'system', content: prompt.system },
        ...prompt.messages,
      ],
    })

    const content = response.choices[0]?.message?.content ?? ''

    return {
      content,
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
      latencyMs: Date.now() - start,
    }
  }

  async streamToSSE(
    prompt: BuiltPrompt,
    res: Response,
    sources: SourceReference[],
    conversationId: string,
    messageId: string,
  ): Promise<{ content: string; inputTokens: number; outputTokens: number; latencyMs: number }> {
    const start = Date.now()
    let fullContent = ''

    try {
      this.writeSSE(res, { type: 'start', conversationId, messageId })

      const stream = await this.client.chat.completions.create({
        model: config.groq.model,
        max_tokens: config.anthropic.maxTokens,
        messages: [
          { role: 'system', content: prompt.system },
          ...prompt.messages,
        ],
        stream: true,
      })

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) {
          fullContent += text
          this.writeSSE(res, { type: 'delta', content: text })
        }
      }

      if (sources.length > 0) {
        this.writeSSE(res, { type: 'sources', sources })
      }

      this.writeSSE(res, { type: 'end', totalTokens: 0, latencyMs: Date.now() - start })
      res.write('data: [DONE]\n\n')
      res.end()

      return { content: fullContent, inputTokens: 0, outputTokens: 0, latencyMs: Date.now() - start }
    } catch (err: unknown) {
      logger.error('Groq streaming error', { error: (err as Error).message })
      if (!res.headersSent) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' })
      }
      this.writeSSE(res, { type: 'error', error: 'AI service error. Please try again.' })
      res.write('data: [DONE]\n\n')
      res.end()
      return { content: '', inputTokens: 0, outputTokens: 0, latencyMs: Date.now() - start }
    }
  }

  private writeSSE(res: Response, data: object): void {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
    if (typeof (res as Response & { flush?: () => void }).flush === 'function') {
      (res as Response & { flush: () => void }).flush()
    }
  }
}

export const claudeService = new ClaudeService()
