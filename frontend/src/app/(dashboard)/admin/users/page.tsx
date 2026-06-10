'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Shield, ShieldCheck, UserPlus } from 'lucide-react'
import { UserTable } from '@/components/admin/UserTable'
import { StatsCard } from '@/components/admin/StatsCard'
import { adminApi } from '@/lib/api/admin'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

export default function UsersPage() {
  const { data: roleCounts } = useQuery({
    queryKey: ['role-counts'],
    queryFn: async () => { const r = await adminApi.getRoleCounts(); return r.data.data! },
    staleTime: 30_000,
  })

  return (
    <div className="flex flex-col h-full overflow-auto" style={{ background: 'linear-gradient(180deg, #070D1C 0%, #080F1E 100%)' }}>
      {/* ─── Header ─── */}
      <header
        className="h-16 px-6 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <Users className="h-4.5 w-4.5" style={{ color: '#10B981' }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-sm font-semibold text-white/90">User Management</h1>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Manage roles, access, and accounts</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: '#10B981',
          }}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Active Directory
        </motion.div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* ─── Stats ─── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-4"
        >
          <motion.div variants={item}>
            <StatsCard title="Regular Users"  value={roleCounts?.USER ?? '…'}        icon={Users}      accent="blue"   />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard title="Admins"         value={roleCounts?.ADMIN ?? '…'}       icon={Shield}     accent="green"  />
          </motion.div>
          <motion.div variants={item}>
            <StatsCard title="Super Admins"   value={roleCounts?.SUPER_ADMIN ?? '…'} icon={ShieldCheck} accent="purple" />
          </motion.div>
        </motion.div>

        {/* ─── Table ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <UserTable />
        </motion.div>
      </div>
    </div>
  )
}
