'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Search, MoreVertical, Shield, ShieldOff, Trash2, UserCog } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { adminApi } from '@/lib/api/admin'
import { User } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils/cn'

const roleBadge: Record<string, 'default' | 'info' | 'warning'> = {
  USER: 'default',
  ADMIN: 'info',
  SUPER_ADMIN: 'warning',
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
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Update failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deleted')
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Delete failed'),
  })

  const users: User[] = data?.users ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-8 h-9 text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <p className="text-sm text-muted-foreground">{meta?.total ?? 0} users</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['User', 'Role', 'Status', 'Last Active', 'Joined', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => {
                const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                const isSelf = user.id === currentUser?.id
                return (
                  <tr key={user.id} className={cn('hover:bg-muted/30 transition-colors', isSelf && 'bg-primary/5')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar ?? undefined} />
                          <AvatarFallback className="text-xs gradient-brand text-white">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name} {isSelf && <span className="text-[10px] text-primary">(you)</span>}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={roleBadge[user.role] ?? 'default'} className="text-[10px]">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={(user as any).isActive !== false ? 'success' : 'secondary'} className="text-[10px]">
                        {(user as any).isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {user.lastActiveAt ? format(new Date(user.lastActiveAt), 'MMM d, HH:mm') : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      {!isSelf && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
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
                            <DropdownMenuItem onClick={() => updateMutation.mutate({ id: user.id, isActive: !(user as any).isActive })}>
                              <UserCog className="h-3.5 w-3.5" />
                              {(user as any).isActive !== false ? 'Deactivate' : 'Activate'}
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
