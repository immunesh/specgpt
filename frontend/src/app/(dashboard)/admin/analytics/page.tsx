'use client'
import { useQuery } from '@tanstack/react-query'
import { Users, MessageSquare, FileText, Cpu } from 'lucide-react'
import { StatsCard } from '@/components/admin/StatsCard'
import { MessagesChart, TokensChart, UsersChart } from '@/components/admin/UsageChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminApi } from '@/lib/api/admin'

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const r = await adminApi.getSystemStats(); return r.data.data! },
    staleTime: 60_000,
  })

  const { data: daily = [], isLoading: dailyLoading } = useQuery({
    queryKey: ['admin-daily', 30],
    queryFn: async () => { const r = await adminApi.getDailyUsage(30); return r.data.data ?? [] },
    staleTime: 60_000,
  })

  const { data: topUsers = [] } = useQuery({
    queryKey: ['admin-top-users'],
    queryFn: async () => { const r = await adminApi.getTopUsers(8); return r.data.data ?? [] },
    staleTime: 60_000,
  })

  return (
    <div className="flex flex-col h-full overflow-auto">
      <header className="h-14 border-b border-border px-6 flex items-center flex-shrink-0">
        <h1 className="text-lg font-semibold">Analytics Dashboard</h1>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Users" value={statsLoading ? '…' : formatNum(stats?.totalUsers ?? 0)} subtitle={`${stats?.activeUsers ?? 0} active in 30 days`} icon={Users} accent="blue" />
          <StatsCard title="Total Messages" value={statsLoading ? '…' : formatNum(stats?.totalMessages ?? 0)} subtitle={`${stats?.totalConversations ?? 0} conversations`} icon={MessageSquare} accent="green" />
          <StatsCard title="Tokens Used" value={statsLoading ? '…' : formatNum(stats?.totalTokensUsed ?? 0)} subtitle={`Avg latency ${stats?.avgLatencyMs ?? 0}ms`} icon={Cpu} accent="purple" />
          <StatsCard title="Documents Ready" value={statsLoading ? '…' : `${stats?.readyDocuments ?? 0}/${stats?.totalDocuments ?? 0}`} subtitle={`${formatNum(stats?.totalChunks ?? 0)} chunks indexed`} icon={FileText} accent="amber" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MessagesChart data={daily} isLoading={dailyLoading} />
          <TokensChart data={daily} isLoading={dailyLoading} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UsersChart data={daily} isLoading={dailyLoading} />

          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topUsers.map((u, i) => (
                <div key={u.userId} className="flex items-center gap-3 py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">{u.messageCount}</p>
                    <p className="text-[10px] text-muted-foreground">messages</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
