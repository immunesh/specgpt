'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MoreVertical, Shield, ShieldOff, Trash2, UserCog, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AxiosError } from 'axios'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { adminApi } from '@/lib/api/admin'
import { User } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils/cn'

type UserRow = User & { isActive?: boolean }

const roleBadge: Record<string, 'default' | 'info' | 'warning'> = {
  USER: 'default',
  ADMIN: 'info',
  SUPER_ADMIN: 'warning',
}

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, type: 'spring', stiffness: 300, damping: 24 },
  }),
}

export function UserTable() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const qc = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const res = await adminApi.listUsers({ page, limit: 15, search: search || undefined })
      return { users: res.data.data ?? [], meta: res.data.meta }
    },
    staleTime: 10_000,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; role?: string; isActive?: boolean }) =>
      adminApi.updateUser(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User updated')
    },
    onError: (e: AxiosError<{ error?: string }>) => toast.error(e?.response?.data?.error ?? 'Update failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deleted')
    },
    onError: (e: AxiosError<{ error?: string }>) => toast.error(e?.response?.data?.error ?? 'Delete failed'),
  })

  const users: UserRow[] = (data?.users ?? []) as UserRow[]
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      {/* ─── Toolbar ─── */}
      <div className="flex items-center gap-3">
        <div
          className="relative flex-1 max-w-sm"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <input
            placeholder="Search by name or email…"
            className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.85)',
            }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <span
          className="text-xs px-3 py-1.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {meta?.total ?? 0} users
        </span>
      </div>

      {/* ─── Table ─── */}
      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                {['User', 'Role', 'Status', 'Last Active', 'Joined', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {users.map((user, i) => {
                  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  const isSelf = user.id === currentUser?.id
                  return (
                    <motion.tr
                      key={user.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: 12 }}
                      className={cn('group transition-colors')}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: isSelf ? 'rgba(0,174,239,0.04)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelf) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = isSelf ? 'rgba(0,174,239,0.04)' : 'transparent'
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={user.avatar ?? undefined} />
                            <AvatarFallback
                              className="text-xs font-bold text-white"
                              style={{ background: 'linear-gradient(135deg, #00AEEF, #0070F3)' }}
                            >
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-white/85">
                              {user.name}{' '}
                              {isSelf && <span className="text-[10px]" style={{ color: '#00AEEF' }}>(you)</span>}
                            </p>
                            <p className="text-[11px] text-white/35">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={roleBadge[user.role] ?? 'default'} className="text-[10px]">
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: user.isActive !== false ? '#10B981' : 'rgba(255,255,255,0.2)' }}
                          />
                          <span className="text-xs" style={{ color: user.isActive !== false ? '#10B981' : 'rgba(255,255,255,0.35)' }}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {user.lastActiveAt ? format(new Date(user.lastActiveAt), 'MMM d, HH:mm') : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        {!isSelf && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                style={{ background: 'rgba(255,255,255,0.06)' }}
                              >
                                <MoreVertical className="h-3.5 w-3.5 text-white/50" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {user.role === 'USER' && (
                                <DropdownMenuItem onClick={() => updateMutation.mutate({ id: user.id, role: 'ADMIN' })}>
                                  <Shield className="h-3.5 w-3.5" />Make Admin
                                </DropdownMenuItem>
                              )}
                              {user.role === 'ADMIN' && (
                                <DropdownMenuItem onClick={() => updateMutation.mutate({ id: user.id, role: 'USER' })}>
                                  <ShieldOff className="h-3.5 w-3.5" />Remove Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => updateMutation.mutate({ id: user.id, isActive: !user.isActive })}>
                                <UserCog className="h-3.5 w-3.5" />
                                {user.isActive !== false ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => { if (confirm(`Delete ${user.name}?`)) deleteMutation.mutate(user.id) }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Search className="h-10 w-10" style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No users found</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1 transition-all disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1 transition-all disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
