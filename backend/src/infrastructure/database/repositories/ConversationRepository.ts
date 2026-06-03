import { Conversation, Message } from '@prisma/client'
import { prisma } from '../client'
import {
  IConversationRepository,
  CreateConversationDto,
  CreateMessageDto,
  ConversationWithLastMessage,
} from '@/domain/repositories/IConversationRepository'
import { NotFoundError } from '@/utils/errors'

export class ConversationRepository implements IConversationRepository {
  async findById(id: string, userId: string): Promise<Conversation | null> {
    return prisma.conversation.findFirst({ where: { id, userId } })
  }

  async findByUserId(
    userId: string,
    params: { page: number; limit: number; archived?: boolean },
  ): Promise<{ conversations: ConversationWithLastMessage[]; total: number }> {
    const { page, limit, archived = false } = params
    const skip = (page - 1) * limit

    const where = { userId, isArchived: archived }

    const [conversations, total] = await prisma.$transaction([
      prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, role: true, createdAt: true },
          },
          _count: { select: { messages: true } },
        },
      }),
      prisma.conversation.count({ where }),
    ])

    return { conversations: conversations as ConversationWithLastMessage[], total }
  }

  async create(data: CreateConversationDto): Promise<Conversation> {
    return prisma.conversation.create({
      data: { userId: data.userId, title: data.title },
    })
  }

  async updateTitle(id: string, userId: string, title: string): Promise<Conversation> {
    const conv = await prisma.conversation.findFirst({ where: { id, userId } })
    if (!conv) throw new NotFoundError('Conversation')
    return prisma.conversation.update({ where: { id }, data: { title } })
  }

  async archive(id: string, userId: string): Promise<Conversation> {
    const conv = await prisma.conversation.findFirst({ where: { id, userId } })
    if (!conv) throw new NotFoundError('Conversation')
    return prisma.conversation.update({ where: { id }, data: { isArchived: true } })
  }

  async pin(id: string, userId: string, pinned: boolean): Promise<Conversation> {
    const conv = await prisma.conversation.findFirst({ where: { id, userId } })
    if (!conv) throw new NotFoundError('Conversation')
    return prisma.conversation.update({ where: { id }, data: { isPinned: pinned } })
  }

  async delete(id: string, userId: string): Promise<void> {
    const conv = await prisma.conversation.findFirst({ where: { id, userId } })
    if (!conv) throw new NotFoundError('Conversation')
    await prisma.conversation.delete({ where: { id } })
  }

  async createMessage(data: CreateMessageDto): Promise<Message> {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        sources: data.sources ?? [],
        tokenCount: data.tokenCount,
        modelUsed: data.modelUsed,
        latencyMs: data.latencyMs,
        isFiltered: data.isFiltered ?? false,
        filterReason: data.filterReason,
      },
    })
  }

  async getMessages(
    conversationId: string,
    userId: string,
    limit = 50,
  ): Promise<Message[]> {
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    })
    if (!conv) throw new NotFoundError('Conversation')

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })
  }
}
