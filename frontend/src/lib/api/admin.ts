import { apiClient } from './client'
import { ApiResponse, User, Document } from '@/types'

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

export interface DailyUsageStat {
  date: string
  messages: number
  conversations: number
  uniqueUsers: number
  totalTokens: number
}

export interface TopUserStat {
  userId: string
  name: string
  email: string
  messageCount: number
  conversationCount: number
  lastActiveAt: string | null
}

export interface RoleCounts {
  USER: number
  ADMIN: number
  SUPER_ADMIN: number
}

export const adminApi = {
  // Users
  listUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    apiClient.get<ApiResponse<User[]>>('/admin/users', { params }),

  updateUser: (id: string, data: { role?: string; isActive?: boolean; name?: string }) =>
    apiClient.patch<ApiResponse<User>>(`/admin/users/${id}`, data),

  deleteUser: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/admin/users/${id}`),

  getRoleCounts: () =>
    apiClient.get<ApiResponse<RoleCounts>>('/admin/users/role-counts'),

  // Analytics
  getSystemStats: () =>
    apiClient.get<ApiResponse<SystemStats>>('/admin/stats'),

  getDailyUsage: (days = 30) =>
    apiClient.get<ApiResponse<DailyUsageStat[]>>('/admin/analytics/daily', { params: { days } }),

  getTopUsers: (limit = 10) =>
    apiClient.get<ApiResponse<TopUserStat[]>>('/admin/analytics/top-users', { params: { limit } }),

  // Documents
  listDocuments: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    apiClient.get<ApiResponse<Document[]>>('/admin/documents', { params }),

  uploadDocument: (formData: FormData) =>
    apiClient.post<ApiResponse<Document>>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteDocument: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/documents/${id}`),

  reprocessDocument: (id: string) =>
    apiClient.post<ApiResponse<Document>>(`/documents/${id}/reprocess`),
}
