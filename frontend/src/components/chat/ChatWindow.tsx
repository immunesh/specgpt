'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble, StreamingBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { EmptyChat } from './EmptyChat'
import { ChatHeader } from './ChatHeader'
import { useChatStore } from '@/store/chatStore'
import { useStreamChat } from '@/hooks/useStreamChat'
import { useConversations } from '@/hooks/useConversations'
import { chatApi } from '@/lib/api/chat'
import { Conversation } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  conversationId?: string
}

export function ChatWindow({ conversationId }: Props) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { sendMessage, abort } = useStreamChat()
  const { refetch: refetchConversations } = useConversations()

  const {
    messages, streamingMessage, isSending, activeConversationId,
    setActiveConversation, setMessages, setLoading, conversations, error,
  } = useChatStore()

  // Load messages when conversationId changes
  const { isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) {
        setActiveConversation(null)
        setMessages([])
        return []
      }
      setLoading(true)
      setActiveConversation(conversationId)
      const res = await chatApi.getMessages(conversationId)
      const msgs = res.data.data ?? []
      setMessages(msgs)
      setLoading(false)
      return msgs
    },
    enabled: true,
    staleTime: 0,
  })

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage?.content])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isSending) return
    setInput('')

    const newConvId = await sendMessage(text, activeConversationId ?? undefined)

    // If this was a new conversation, update URL and refresh list
    if (!activeConversationId && newConvId) {
      router.replace(`/chat/${newConvId}`, { scroll: false })
      refetchConversations()
    }
  }, [input, isSending, sendMessage, activeConversationId, router, refetchConversations])

  const activeConversation: Conversation | null =
    conversations.find((c) => c.id === activeConversationId) ?? null

  const isEmpty = messages.length === 0 && !streamingMessage && !isLoading

  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversation={activeConversation} onNewChat={() => router.push('/chat')} />

      <div className="flex-1 overflow-hidden relative">
        {isEmpty ? (
          <EmptyChat onSelectPrompt={(p) => { setInput(p) }} />
        ) : (
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Streaming message */}
              {streamingMessage && (
                streamingMessage.content
                  ? <StreamingBubble content={streamingMessage.content} />
                  : <TypingIndicator />
              )}

              {error && (
                <div className="text-center">
                  <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-4 py-2 inline-block">
                    {error}
                  </p>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-4 bg-background flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <MessageInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onAbort={abort}
            isStreaming={isSending}
          />
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            5G SpecGPT answers 5G/3GPP questions only · Always verify specs with official 3GPP documents
          </p>
        </div>
      </div>
    </div>
  )
}
