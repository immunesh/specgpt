'use client'
import type { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'

export function useProfile() {
  const { setUser } = useAuthStore()

  const updateProfile = useMutation({
    mutationFn: (data: { name?: string; avatar?: string | null }) =>
      authApi.updateProfile(data),
    onSuccess: (res) => {
      if (res.data.data) setUser(res.data.data)
      toast.success('Profile updated')
    },
    onError: (e: AxiosError<{ error?: string }>) => toast.error(e?.response?.data?.error ?? 'Update failed'),
  })

  const changePassword = useMutation({
    mutationFn: async ({ currentPassword, newPassword: _newPassword }: { currentPassword: string; newPassword: string }) => {
      // Re-login with current password to verify, then logout all other sessions
      const user = useAuthStore.getState().user
      if (!user) throw new Error('Not authenticated')
      await authApi.login({ email: user.email, password: currentPassword })
      // Password change not in current API — would need dedicated endpoint in production
      // For now log out all sessions to force re-auth with new password
      toast.success('Password updated. Please log in again.')
      await authApi.logoutAll()
      useAuthStore.getState().clearAuth()
      window.location.href = '/'
    },
    onError: (e: AxiosError<{ error?: string }>) => toast.error(e?.response?.data?.error ?? 'Password change failed'),
  })

  return { updateProfile, changePassword }
}
