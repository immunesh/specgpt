'use client'
import { useCallback, useRef } from 'react'
import { useChatStore } from '@/store/chatStore'
import { StreamEvent, Message, SourceReference } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function useStreamChat() {
  const store = useChatStore()
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (message: string, conversationId?: string): Promise<string | null> => {
      // Optimistically add user message
      const userMsg: Message = {
        id: crypto.randomUUID(),
        conversationId: conversationId ?? '',
        role: 'user',
        content: message,
        sources: [],
        createdAt: new Date().toISOString(),
      }
      store.addMessage(userMsg)
      store.setError(null)

      abortRef.current = new AbortController()
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

      try {
        const res = await fetch(`${API_URL}/api/v1/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message, conversationId, stream: true }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Chat request failed' }))
          throw new Error(err.error ?? 'Chat request failed')
        }

        if (!res.body) throw new Error('No response body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let finalConversationId = conversationId ?? null
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') break

            try {
              const event = JSON.parse(payload) as StreamEvent

              switch (event.type) {
                case 'start':
                  finalConversationId = event.conversationId ?? finalConversationId
                  store.startStreaming(event.messageId ?? crypto.randomUUID())

                  // Update conversationId on user message
                  if (event.conversationId && !conversationId) {
                    store.setActiveConversation(event.conversationId)
                    // Patch the optimistic user message conversationId
                    store.setMessages(
                      useChatStore.getState().messages.map((m) =>
                        m.id === userMsg.id ? { ...m, conversationId: event.conversationId! } : m,
                      ),
                    )
                  }
                  break

                case 'delta':
                  if (event.content) store.appendStreamDelta(event.content)
                  break

                case 'sources':
                  if (event.sources) store.setStreamSources(event.sources as SourceReference[])
                  break

                case 'end':
                  store.endStreaming()
                  break

                case 'error':
                  throw new Error(event.error ?? 'Stream error')
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        return finalConversationId
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send message')
        if (error.name === 'AbortError') {
          store.abortStreaming()
          return conversationId ?? null
        }

        store.abortStreaming()
        store.setError(error.message)
        return conversationId ?? null
      }
    },
    [store],
  )

  const abort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { sendMessage, abort }
}
