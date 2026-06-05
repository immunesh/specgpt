'use client'
import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

function GoogleCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      toast.error('Google sign-in was cancelled or failed.')
      router.replace('/login')
      return
    }

    const redirectUri = `${window.location.origin}/auth/callback/google`

    authApi.googleAuth({ code, redirectUri })
      .then((res) => {
        const { user, accessToken } = res.data.data!
        setAuth(user, accessToken)
        toast.success(`Welcome, ${user.name}!`)
        router.replace('/chat')
      })
      .catch((err) => {
        const msg = err?.response?.data?.error ?? 'Google authentication failed.'
        toast.error(msg)
        router.replace('/login')
      })
  }, [params, router, setAuth])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-sm">Completing sign-in with Google…</p>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground text-sm">Completing sign-in with Google…</p>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}
