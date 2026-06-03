export interface User {
  id: string
  email: string
  name: string
  avatar?: string | null
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  createdAt: string
  lastActiveAt?: string | null
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface Conversation {
  id: string
  title: string
  userId: string
  isArchived: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  messages: Pick<Message, 'content' | 'role' | 'createdAt'>[]
  _count: { messages: number }
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources: SourceReference[]
  tokenCount?: number
  modelUsed?: string
  latencyMs?: number
  isFiltered?: boolean
  createdAt: string
}

export interface SourceReference {
  documentId: string
  documentName: string
  specNumber?: string
  release?: string
  section?: string
  pageNumber?: number
  relevanceScore: number
  excerpt: string
}

export interface Document {
  id: string
  name: string
  fileName: string
  fileSize: number
  mimeType: string
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
  specNumber?: string
  specTitle?: string
  series?: string
  release?: string
  version?: string
  chunkCount?: number
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total: number
    totalPages: number
    page: number
    limit: number
  }
}

export interface StreamEvent {
  type: 'start' | 'delta' | 'sources' | 'end' | 'error'
  conversationId?: string
  messageId?: string
  content?: string
  sources?: SourceReference[]
  totalTokens?: number
  error?: string
}
