'use client'
import { useAuthStore } from '@/store/authStore'
import { redirect } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()

  if (user && user.role === 'USER') {
    redirect('/chat')
  }

  return <>{children}</>
}
