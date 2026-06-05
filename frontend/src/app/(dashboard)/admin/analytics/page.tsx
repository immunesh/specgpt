'use client'
import { useQuery } from '@tanstack/react-query'
import { Users, MessageSquare, FileText, Cpu, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { StatsCard } from '@/components/admin/StatsCard'
import { MessagesChart, TokensChart, UsersChart } from '@/components/admin/UsageChart'
import { adminApi } from '@/lib/api/admin'

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
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
    <div className="flex flex-col h-full overflow-auto" style={{ background: 'linear-gradient(180deg, #070D1C 0%, #080F1E 100%)' }}>
      {/* ─── Header ─── */}
      <header
        className="h-14 px-6 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B22, #F59E0B44)' }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white/90">Analytics Dashboard</h1>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>System performance overview</p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: '#10B981',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Data
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* ─── Stats grid ─── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={item}>
            <StatsCard
              title="Total Users"
              value={statsLoading ? '…' : formatNum(stats?.totalUsers ?? 0)}
              subtitle={`${stats?.activeUsers ?? 0} active in 30 days`}
              icon={Users}
              accent="blue"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard
              title="Total Messages"
              value={statsLoading ? '…' : formatNum(stats?.totalMessages ?? 0)}
              subtitle={`${stats?.totalConversations ?? 0} conversations`}
              icon={MessageSquare}
              accent="green"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard
              title="Tokens Used"
              value={statsLoading ? '…' : formatNum(stats?.totalTokensUsed ?? 0)}
              subtitle={`Avg latency ${stats?.avgLatencyMs ?? 0}ms`}
              icon={Cpu}
              accent="purple"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard
              title="Documents Ready"
              value={statsLoading ? '…' : `${stats?.readyDocuments ?? 0}/${stats?.totalDocuments ?? 0}`}
              subtitle={`${formatNum(stats?.totalChunks ?? 0)} chunks indexed`}
              icon={FileText}
              accent="amber"
            />
          </motion.div>
        </motion.div>

        {/* ─── Charts ─── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <motion.div variants={item}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <MessagesChart data={daily} isLoading={dailyLoading} />
          </motion.div>
          <motion.div variants={item}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <TokensChart data={daily} isLoading={dailyLoading} />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <UsersChart data={daily} isLoading={dailyLoading} />
          </div>

          {/* ─── Top Users ─── */}
          <div
            className="rounded-2xl p-5"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/80">Top Users</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,174,239,0.1)', color: '#5BB8D4', border: '1px solid rgba(0,174,239,0.2)' }}
              >
                Last 30 days
              </span>
            </div>

            <div className="space-y-1">
              {topUsers.map((u, i) => (
                <motion.div
                  key={u.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl transition-all hover:bg-white/4"
                  style={{ borderBottom: i < topUsers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  {/* Rank */}
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                    style={{
                      background: i < 3 ? 'rgba(0,174,239,0.15)' : 'rgba(255,255,255,0.05)',
                      color: i < 3 ? '#00AEEF' : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${i < 3 ? 'rgba(0,174,239,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white/80">{u.name}</p>
                    <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{u.email}</p>
                  </div>

                  {/* Messages */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold" style={{ color: '#5BB8D4' }}>{u.messageCount}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>msgs</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
