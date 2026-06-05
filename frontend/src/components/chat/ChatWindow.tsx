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
import { motion, AnimatePresence } from 'framer-motion'

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage?.content])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isSending) return
    setInput('')

    const newConvId = await sendMessage(text, activeConversationId ?? undefined)
    if (!activeConversationId && newConvId) {
      router.replace(`/chat/${newConvId}`, { scroll: false })
      refetchConversations()
    }
  }, [input, isSending, sendMessage, activeConversationId, router, refetchConversations])

  const activeConversation: Conversation | null =
    conversations.find((c) => c.id === activeConversationId) ?? null

  const isEmpty = messages.length === 0 && !streamingMessage && !isLoading

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #070D1C 0%, #080F1E 100%)' }}>
      <ChatHeader conversation={activeConversation} onNewChat={() => router.push('/chat')} />

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <EmptyChat onSelectPrompt={(p) => { setInput(p) }} />
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <ScrollArea className="h-full">
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}

                  {streamingMessage && (
                    streamingMessage.content
                      ? <StreamingBubble content={streamingMessage.content} />
                      : <TypingIndicator />
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <p
                        className="text-xs rounded-xl px-4 py-2 inline-block"
                        style={{
                          color: '#F87171',
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                        }}
                      >
                        {error}
                      </p>
                    </motion.div>
                  )}

                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-3xl mx-auto">
          <MessageInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onAbort={abort}
            isStreaming={isSending}
          />
          <p
            className="text-[10px] text-center mt-2"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            5G SpecGPT answers 5G/3GPP questions only · Always verify specs with official 3GPP documents
          </p>
        </div>
      </div>
    </div>
  )
}
