import { create } from 'zustand'
import { Message, Conversation, SourceReference } from '@/types'

export interface StreamingMessage {
  id: string
  content: string
  sources: SourceReference[]
  isStreaming: boolean
}

interface ChatStore {
  // Active conversation
  activeConversationId: string | null
  messages: Message[]
  streamingMessage: StreamingMessage | null

  // Conversation list
  conversations: Conversation[]
  conversationsTotal: number

  // UI state
  isLoading: boolean
  isSending: boolean
  error: string | null

  // Actions
  setActiveConversation: (id: string | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setConversations: (conversations: Conversation[], total: number) => void
  prependConversation: (conversation: Conversation) => void
  updateConversation: (id: string, data: Partial<Conversation>) => void
  removeConversation: (id: string) => void

  startStreaming: (messageId: string) => void
  appendStreamDelta: (delta: string) => void
  setStreamSources: (sources: SourceReference[]) => void
  endStreaming: () => Message | null
  abortStreaming: () => void

  setLoading: (v: boolean) => void
  setSending: (v: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  activeConversationId: null,
  messages: [],
  streamingMessage: null,
  conversations: [],
  conversationsTotal: 0,
  isLoading: false,
  isSending: false,
  error: null,

  setActiveConversation: (id) => set({ activeConversationId: id, messages: [], streamingMessage: null, error: null }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),

  setConversations: (conversations, total) => set({ conversations, conversationsTotal: total }),
  prependConversation: (conversation) =>
    set((s) => ({ conversations: [conversation, ...s.conversations.filter((c) => c.id !== conversation.id)] })),
  updateConversation: (id, data) =>
    set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
  removeConversation: (id) =>
    set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) })),

  startStreaming: (messageId) =>
    set({ streamingMessage: { id: messageId, content: '', sources: [], isStreaming: true }, isSending: true }),

  appendStreamDelta: (delta) =>
    set((s) => ({
      streamingMessage: s.streamingMessage
        ? { ...s.streamingMessage, content: s.streamingMessage.content + delta }
        : null,
    })),

  setStreamSources: (sources) =>
    set((s) => ({ streamingMessage: s.streamingMessage ? { ...s.streamingMessage, sources } : null })),

  endStreaming: () => {
    const { streamingMessage, messages, activeConversationId } = get()
    if (!streamingMessage) return null

    const msg: Message = {
      id: streamingMessage.id,
      conversationId: activeConversationId ?? '',
      role: 'assistant',
      content: streamingMessage.content,
      sources: streamingMessage.sources,
      createdAt: new Date().toISOString(),
    }

    set({ messages: [...messages, msg], streamingMessage: null, isSending: false })
    return msg
  },

  abortStreaming: () =>
    set((s) => ({
      streamingMessage: s.streamingMessage ? { ...s.streamingMessage, isStreaming: false } : null,
      isSending: false,
    })),

  setLoading: (v) => set({ isLoading: v }),
  setSending: (v) => set({ isSending: v }),
  setError: (e) => set({ error: e }),
  reset: () => set({ activeConversationId: null, messages: [], streamingMessage: null, error: null }),
}))
