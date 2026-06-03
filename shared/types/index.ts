// ============================================================
// Shared Types - Used by both Frontend and Backend
// ============================================================

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  createdAt: string
  lastActiveAt?: string
}

export interface Conversation {
  id: string
  title: string
  userId: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage?: string
}

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  sources?: SourceReference[]
  tokenCount?: number
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
  status: DocumentStatus
  specNumber?: string
  release?: string
  seriesType?: string
  uploadedBy: string
  createdAt: string
  chunkCount?: number
}

export interface ChatRequest {
  conversationId?: string
  message: string
  stream?: boolean
}

export interface ChatStreamEvent {
  type: 'start' | 'delta' | 'sources' | 'end' | 'error'
  conversationId?: string
  messageId?: string
  content?: string
  sources?: SourceReference[]
  error?: string
}
