import { apiClient } from './client'
import { ApiResponse, User } from '@/types'

export interface LoginDto { email: string; password: string }
export interface RegisterDto { email: string; name: string; password: string }
export interface GoogleAuthDto { idToken?: string; code?: string; redirectUri?: string }

export interface AuthResponseData {
  user: User
  accessToken: string
  expiresIn: number
}

export const authApi = {
  register: (data: RegisterDto) =>
    apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', data),

  login: (data: LoginDto) =>
    apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', data),

  googleAuth: (data: GoogleAuthDto) =>
    apiClient.post<ApiResponse<AuthResponseData>>('/auth/google', data),

  getGoogleUrl: (state?: string) =>
    apiClient.get<ApiResponse<{ url: string }>>('/auth/google/url', { params: { state } }),

  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string; expiresIn: number }>>('/auth/refresh', {}),

  logout: () =>
    apiClient.post('/auth/logout'),

  logoutAll: () =>
    apiClient.post('/auth/logout-all'),

  me: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: { name?: string; avatar?: string | null }) =>
    apiClient.patch<ApiResponse<User>>('/auth/me', data),
}
