export interface DailyUsageStat {
  date: string
  messages: number
  conversations: number
  uniqueUsers: number
  totalTokens: number
}

export interface TopQueryStat {
  query: string
  count: number
}

export interface UserActivityStat {
  userId: string
  name: string
  email: string
  messageCount: number
  conversationCount: number
  lastActiveAt: Date | null
}

export interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalConversations: number
  totalMessages: number
  totalDocuments: number
  readyDocuments: number
  totalChunks: number
  totalTokensUsed: number
  avgLatencyMs: number
}

export interface IAnalyticsRepository {
  getSystemStats(): Promise<SystemStats>
  getDailyUsage(days: number): Promise<DailyUsageStat[]>
  getTopUsers(limit: number): Promise<UserActivityStat[]>
  recordEvent(data: {
    userId?: string
    eventType: string
    eventData?: object
    sessionId?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<void>
  recordApiUsage(data: {
    userId: string
    conversationId?: string
    model: string
    inputTokens: number
    outputTokens: number
    latencyMs: number
    isStreamed: boolean
  }): Promise<void>
}
