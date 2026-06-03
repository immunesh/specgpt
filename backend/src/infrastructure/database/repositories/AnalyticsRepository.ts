import { prisma } from '../client'
import {
  IAnalyticsRepository,
  SystemStats,
  DailyUsageStat,
  UserActivityStat,
} from '@/domain/repositories/IAnalyticsRepository'

export class AnalyticsRepository implements IAnalyticsRepository {
  async getSystemStats(): Promise<SystemStats> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      totalUsers,
      activeUsers,
      totalConversations,
      totalMessages,
      docStats,
      tokenStats,
      latencyStats,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { lastActiveAt: { gte: thirtyDaysAgo } } }),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.document.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { chunkCount: true },
      }),
      prisma.apiUsage.aggregate({ _sum: { totalTokens: true } }),
      prisma.apiUsage.aggregate({ _avg: { latencyMs: true } }),
    ])

    const totalDocuments = docStats.reduce((sum, d) => sum + d._count.status, 0)
    const readyDoc = docStats.find((d) => d.status === 'READY')
    const readyDocuments = readyDoc?._count.status ?? 0
    const totalChunks = docStats.reduce((sum, d) => sum + (d._sum.chunkCount ?? 0), 0)

    return {
      totalUsers,
      activeUsers,
      totalConversations,
      totalMessages,
      totalDocuments,
      readyDocuments,
      totalChunks,
      totalTokensUsed: tokenStats._sum.totalTokens ?? 0,
      avgLatencyMs: Math.round(latencyStats._avg.latencyMs ?? 0),
    }
  }

  async getDailyUsage(days: number): Promise<DailyUsageStat[]> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    type DailyRow = {
      date: Date
      messages: bigint
      conversations: bigint
      unique_users: bigint
      total_tokens: bigint
    }

    const rows = await prisma.$queryRaw<DailyRow[]>`
      SELECT
        DATE(m.created_at) AS date,
        COUNT(m.id) AS messages,
        COUNT(DISTINCT c.id) AS conversations,
        COUNT(DISTINCT c.user_id) AS unique_users,
        COALESCE(SUM(au.total_tokens), 0) AS total_tokens
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      LEFT JOIN api_usage au ON au.conversation_id = c.id
        AND DATE(au.created_at) = DATE(m.created_at)
      WHERE m.created_at >= ${since}
      GROUP BY DATE(m.created_at)
      ORDER BY DATE(m.created_at) ASC
    `

    return rows.map((r) => ({
      date: r.date.toISOString().split('T')[0],
      messages: Number(r.messages),
      conversations: Number(r.conversations),
      uniqueUsers: Number(r.unique_users),
      totalTokens: Number(r.total_tokens),
    }))
  }

  async getTopUsers(limit: number): Promise<UserActivityStat[]> {
    type Row = {
      user_id: string
      name: string
      email: string
      message_count: bigint
      conversation_count: bigint
      last_active_at: Date | null
    }

    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        u.id AS user_id,
        u.name,
        u.email,
        COUNT(DISTINCT m.id) AS message_count,
        COUNT(DISTINCT c.id) AS conversation_count,
        u.last_active_at
      FROM users u
      LEFT JOIN conversations c ON c.user_id = u.id
      LEFT JOIN messages m ON m.conversation_id = c.id AND m.role = 'user'
      GROUP BY u.id, u.name, u.email, u.last_active_at
      ORDER BY message_count DESC
      LIMIT ${limit}
    `

    return rows.map((r) => ({
      userId: r.user_id,
      name: r.name,
      email: r.email,
      messageCount: Number(r.message_count),
      conversationCount: Number(r.conversation_count),
      lastActiveAt: r.last_active_at,
    }))
  }

  async recordEvent(data: {
    userId?: string
    eventType: string
    eventData?: object
    sessionId?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    await prisma.userEvent.create({
      data: {
        userId: data.userId,
        eventType: data.eventType,
        eventData: data.eventData ?? {},
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  }

  async recordApiUsage(data: {
    userId: string
    conversationId?: string
    model: string
    inputTokens: number
    outputTokens: number
    latencyMs: number
    isStreamed: boolean
  }): Promise<void> {
    await prisma.apiUsage.create({
      data: {
        userId: data.userId,
        conversationId: data.conversationId,
        model: data.model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.inputTokens + data.outputTokens,
        latencyMs: data.latencyMs,
        isStreamed: data.isStreamed,
      },
    })
  }
}
