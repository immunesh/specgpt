import { Conversation, Message, MessageRole } from '@prisma/client'

export interface CreateConversationDto {
  userId: string
  title: string
}

export interface CreateMessageDto {
  conversationId: string
  role: MessageRole
  content: string
  sources?: object[]
  tokenCount?: number
  modelUsed?: string
  latencyMs?: number
  isFiltered?: boolean
  filterReason?: string
}

export type ConversationWithLastMessage = Conversation & {
  messages: Pick<Message, 'content' | 'role' | 'createdAt'>[]
  _count: { messages: number }
}

export interface IConversationRepository {
  findById(id: string, userId: string): Promise<Conversation | null>
  findByUserId(
    userId: string,
    params: { page: number; limit: number; archived?: boolean },
  ): Promise<{ conversations: ConversationWithLastMessage[]; total: number }>
  create(data: CreateConversationDto): Promise<Conversation>
  updateTitle(id: string, userId: string, title: string): Promise<Conversation>
  archive(id: string, userId: string): Promise<Conversation>
  pin(id: string, userId: string, pinned: boolean): Promise<Conversation>
  delete(id: string, userId: string): Promise<void>
  createMessage(data: CreateMessageDto): Promise<Message>
  getMessages(
    conversationId: string,
    userId: string,
    limit?: number,
  ): Promise<Message[]>
}
