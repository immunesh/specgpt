'use client'
import { useQuery } from '@tanstack/react-query'
import { Users, Shield, ShieldCheck } from 'lucide-react'
import { UserTable } from '@/components/admin/UserTable'
import { StatsCard } from '@/components/admin/StatsCard'
import { adminApi } from '@/lib/api/admin'

export default function UsersPage() {
  const { data: roleCounts } = useQuery({
    queryKey: ['role-counts'],
    queryFn: async () => { const r = await adminApi.getRoleCounts(); return r.data.data! },
    staleTime: 30_000,
  })

  return (
    <div className="flex flex-col h-full overflow-auto">
      <header className="h-14 border-b border-border px-6 flex items-center flex-shrink-0">
        <h1 className="text-lg font-semibold">User Management</h1>
      </header>
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatsCard title="Regular Users" value={roleCounts?.USER ?? '…'} icon={Users} accent="blue" />
          <StatsCard title="Admins" value={roleCounts?.ADMIN ?? '…'} icon={Shield} accent="green" />
          <StatsCard title="Super Admins" value={roleCounts?.SUPER_ADMIN ?? '…'} icon={ShieldCheck} accent="purple" />
        </div>
        <UserTable />
      </div>
    </div>
  )
}
