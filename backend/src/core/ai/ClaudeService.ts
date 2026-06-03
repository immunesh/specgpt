import Anthropic from '@anthropic-ai/sdk'
import { config } from '@/config'
import { logger } from '@/utils/logger'
import { BuiltPrompt } from './PromptBuilder'
import { SourceReference } from '@5g-specgpt/shared'
import { Response } from 'express'

export interface StreamCallbacks {
  onStart?: () => void
  onDelta: (text: string) => void
  onEnd: (usage: { inputTokens: number; outputTokens: number }) => void
  onError: (err: Error) => void
}

export interface ChatCompletionResult {
  content: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
}

export class ClaudeService {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({ apiKey: config.anthropic.apiKey })
  }

  // Non-streaming — returns complete response
  async complete(prompt: BuiltPrompt): Promise<ChatCompletionResult> {
    const start = Date.now()

    const response = await this.client.messages.create({
      model: config.anthropic.model,
      max_tokens: config.anthropic.maxTokens,
      system: prompt.system,
      messages: prompt.messages,
    })

    const content = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    return {
      content,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      latencyMs: Date.now() - start,
    }
  }

  // Streaming via Server-Sent Events to Express response
  async streamToSSE(
    prompt: BuiltPrompt,
    res: Response,
    sources: SourceReference[],
    conversationId: string,
    messageId: string,
  ): Promise<{ content: string; inputTokens: number; outputTokens: number; latencyMs: number }> {
    const start = Date.now()
    let fullContent = ''
    let inputTokens = 0
    let outputTokens = 0

    try {
      const stream = await this.client.messages.create({
        model: config.anthropic.model,
        max_tokens: config.anthropic.maxTokens,
        system: prompt.system,
        messages: prompt.messages,
        stream: true,
      })

      // Send start event
      this.writeSSE(res, {
        type: 'start',
        conversationId,
        messageId,
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const text = event.delta.text
          fullContent += text
          this.writeSSE(res, { type: 'delta', content: text })
        }

        if (event.type === 'message_delta' && event.usage) {
          outputTokens = event.usage.output_tokens
        }

        if (event.type === 'message_start' && event.message.usage) {
          inputTokens = event.message.usage.input_tokens
        }
      }

      // Send sources after content is done
      if (sources.length > 0) {
        this.writeSSE(res, { type: 'sources', sources })
      }

      // Send end event
      this.writeSSE(res, {
        type: 'end',
        totalTokens: inputTokens + outputTokens,
        latencyMs: Date.now() - start,
      })

      res.write('data: [DONE]\n\n')
      res.end()

      return {
        content: fullContent,
        inputTokens,
        outputTokens,
        latencyMs: Date.now() - start,
      }
    } catch (err: any) {
      logger.error('Claude streaming error', { error: err.message })
      this.writeSSE(res, { type: 'error', error: 'AI service error. Please try again.' })
      res.write('data: [DONE]\n\n')
      res.end()
      throw err
    }
  }

  private writeSSE(res: Response, data: object): void {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
}

export const claudeService = new ClaudeService()
