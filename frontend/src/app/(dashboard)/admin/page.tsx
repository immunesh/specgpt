'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users, FileText, MessageSquare, Cpu, TrendingUp,
  ArrowRight, Shield, BarChart3, Upload, Activity,
  Zap, Globe, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react'
import { StatsCard } from '@/components/admin/StatsCard'
import { adminApi } from '@/lib/api/admin'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const quickActions = [
  { href: '/admin/users',     label: 'Manage Users',     desc: 'View, edit, promote users',        icon: Users,    color: '#00AEEF', bg: 'rgba(0,174,239,0.08)',   border: 'rgba(0,174,239,0.2)' },
  { href: '/admin/analytics', label: 'Analytics',        desc: 'Usage charts & performance',       icon: BarChart3, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  { href: '/admin/documents', label: 'Documents',        desc: 'Upload & manage 5G specs',         icon: FileText, color: '#EC4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)' },
]

export default function AdminOverviewPage() {
  const { user } = useAuthStore()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const r = await adminApi.getSystemStats(); return r.data.data! },
    staleTime: 60_000,
  })

  const { data: topUsers = [] } = useQuery({
    queryKey: ['admin-top-users'],
    queryFn: async () => { const r = await adminApi.getTopUsers(5); return r.data.data ?? [] },
    staleTime: 60_000,
  })

  const { data: roleCounts } = useQuery({
    queryKey: ['role-counts'],
    queryFn: async () => { const r = await adminApi.getRoleCounts(); return r.data.data! },
    staleTime: 30_000,
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div
      className="flex flex-col h-full overflow-auto"
      style={{ background: 'linear-gradient(180deg, #070D1C 0%, #080F1E 100%)' }}
    >
      {/* ─── Header ─── */}
      <header
        className="h-16 px-6 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,174,239,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(0,174,239,0.3)' }}
          >
            <Shield className="h-4.5 w-4.5" style={{ color: '#00AEEF' }} />
          </motion.div>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-semibold"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              Admin Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[10px]"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {greeting}, {user?.name?.split(' ')[0]} — {format(new Date(), 'MMMM d, yyyy')}
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#10B981',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          System Online
        </motion.div>
      </header>

      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {/* ─── Stats Grid ─── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={item}>
            <StatsCard
              title="Total Users"
              value={isLoading ? '…' : formatNum(stats?.totalUsers ?? 0)}
              subtitle={`${stats?.activeUsers ?? 0} active this month`}
              icon={Users}
              accent="blue"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard
              title="Messages"
              value={isLoading ? '…' : formatNum(stats?.totalMessages ?? 0)}
              subtitle={`${stats?.totalConversations ?? 0} conversations`}
              icon={MessageSquare}
              accent="green"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard
              title="Tokens Used"
              value={isLoading ? '…' : formatNum(stats?.totalTokensUsed ?? 0)}
              subtitle={`Avg ${stats?.avgLatencyMs ?? 0}ms latency`}
              icon={Cpu}
              accent="purple"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard
              title="Documents"
              value={isLoading ? '…' : `${stats?.readyDocuments ?? 0}/${stats?.totalDocuments ?? 0}`}
              subtitle={`${formatNum(stats?.totalChunks ?? 0)} chunks indexed`}
              icon={FileText}
              accent="amber"
            />
          </motion.div>
        </motion.div>

        {/* ─── Quick Actions + Role Breakdown ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {quickActions.map(({ href, label, desc, icon: Icon, color, bg, border }) => (
              <motion.div key={href} variants={item}>
                <Link href={href}>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden rounded-2xl p-5 h-full group cursor-pointer"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                        transform: 'translate(30%, -30%)',
                      }}
                    />
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <p className="text-sm font-semibold text-white/90 mb-1">{label}</p>
                      <p className="text-[11px] text-white/40">{desc}</p>
                      <div className="mt-4 flex items-center gap-1 text-[11px] font-medium" style={{ color }}>
                        Open <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Role Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white/80">User Roles</h3>
              <Globe className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <div className="space-y-3">
              {[
                { label: 'Regular Users', value: roleCounts?.USER ?? 0,       color: '#00AEEF', bg: 'rgba(0,174,239,0.1)' },
                { label: 'Admins',        value: roleCounts?.ADMIN ?? 0,       color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
                { label: 'Super Admins',  value: roleCounts?.SUPER_ADMIN ?? 0, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
              ].map(({ label, value, color, bg }) => {
                const total = (roleCounts?.USER ?? 0) + (roleCounts?.ADMIN ?? 0) + (roleCounts?.SUPER_ADMIN ?? 0)
                const pct = total ? Math.round((value / total) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/50">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white/80">{value}</span>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              className="mt-5 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Total accounts</span>
                <span className="text-sm font-bold text-white/90">
                  {((roleCounts?.USER ?? 0) + (roleCounts?.ADMIN ?? 0) + (roleCounts?.SUPER_ADMIN ?? 0))}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Top Users + System Health ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl p-5"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/80">Top Users</h3>
              <Link href="/admin/users">
                <span
                  className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity"
                  style={{ color: '#00AEEF' }}
                >
                  View all <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
            <div className="space-y-1">
              {topUsers.map((u, i) => (
                <motion.div
                  key={u.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl transition-all"
                  style={{ background: i === 0 ? 'rgba(0,174,239,0.05)' : 'transparent' }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                    style={{
                      background: i < 3 ? 'rgba(0,174,239,0.15)' : 'rgba(255,255,255,0.05)',
                      color: i < 3 ? '#00AEEF' : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${i < 3 ? 'rgba(0,174,239,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-white/80">{u.name}</p>
                    <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{u.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold" style={{ color: '#5BB8D4' }}>{u.messageCount}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>msgs</p>
                  </div>
                </motion.div>
              ))}
              {topUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Activity className="h-8 w-8" style={{ color: 'rgba(255,255,255,0.1)' }} />
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No activity yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-5"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white/80">System Health</h3>
              <Zap className="h-4 w-4" style={{ color: '#F59E0B' }} />
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'AI Response Latency',
                  value: `${stats?.avgLatencyMs ?? 0}ms`,
                  status: (stats?.avgLatencyMs ?? 0) < 2000 ? 'good' : 'warn',
                  sub: 'Average across all requests',
                },
                {
                  label: 'Documents Ready',
                  value: `${stats?.readyDocuments ?? 0} / ${stats?.totalDocuments ?? 0}`,
                  status: (stats?.readyDocuments ?? 0) === (stats?.totalDocuments ?? 0) && (stats?.totalDocuments ?? 0) > 0 ? 'good' : 'warn',
                  sub: `${formatNum(stats?.totalChunks ?? 0)} vector chunks indexed`,
                },
                {
                  label: 'Active Users (30d)',
                  value: formatNum(stats?.activeUsers ?? 0),
                  status: 'good',
                  sub: `of ${formatNum(stats?.totalUsers ?? 0)} total registered`,
                },
                {
                  label: 'Total Conversations',
                  value: formatNum(stats?.totalConversations ?? 0),
                  status: 'good',
                  sub: `${formatNum(stats?.totalMessages ?? 0)} messages total`,
                },
              ].map(({ label, value, status, sub }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 py-2.5 px-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.025)' }}
                >
                  {status === 'good'
                    ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#10B981' }} />
                    : <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">{label}</span>
                      <span className="text-xs font-semibold text-white/90">{isLoading ? '…' : value}</span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/admin/analytics">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: '#F59E0B',
                }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                View Full Analytics
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
