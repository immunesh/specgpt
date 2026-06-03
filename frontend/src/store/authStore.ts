import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types'
import { authApi } from '@/lib/api/auth'

interface AuthStore {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (user: User, accessToken: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
  hydrateFromStorage: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
        }
        set({ user, accessToken, isAuthenticated: true, isLoading: false })
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
        }
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // Ignore — clear local state regardless
        }
        get().clearAuth()
      },

      refreshSession: async () => {
        try {
          const res = await authApi.refresh()
          const { accessToken } = res.data.data!
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken)
          }
          set({ accessToken, isAuthenticated: true })
          return true
        } catch {
          get().clearAuth()
          return false
        }
      },

      hydrateFromStorage: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken')
          if (token) {
            set({ accessToken: token })
          }
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
