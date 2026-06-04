import { apiClient } from './client'
import { ApiResponse, Conversation, Message } from '@/types'

export const chatApi = {
  sendMessage: (data: { message: string; conversationId?: string; stream?: boolean }) =>
    apiClient.post<ApiResponse<{ conversationId: string; messageId: string; content: string; sources: unknown[] }>>('/chat', { ...data, stream: false }),

  listConversations: (params?: { page?: number; limit?: number; archived?: boolean }) =>
    apiClient.get<ApiResponse<Conversation[]>>('/chat/conversations', { params }),

  getMessages: (conversationId: string, params?: { limit?: number }) =>
    apiClient.get<ApiResponse<Message[]>>(`/chat/conversations/${conversationId}/messages`, { params }),

  updateConversation: (id: string, data: { title?: string; isPinned?: boolean }) =>
    apiClient.patch<ApiResponse<void>>(`/chat/conversations/${id}`, data),

  archiveConversation: (id: string) =>
    apiClient.post<ApiResponse<void>>(`/chat/conversations/${id}/archive`),

  deleteConversation: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/chat/conversations/${id}`),

  exportConversation: (id: string) =>
    apiClient.get(`/chat/conversations/${id}/export`, { responseType: 'blob' }),

  search: (params: { q: string; limit?: number; minScore?: number }) =>
    apiClient.get<ApiResponse<unknown[]>>('/chat/search', { params }),
}
