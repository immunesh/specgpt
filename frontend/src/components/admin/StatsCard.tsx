'use client'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  className?: string
  accent?: 'blue' | 'green' | 'purple' | 'amber' | 'cyan' | 'pink'
}

const accents = {
  blue:   { color: '#00AEEF', bg: 'rgba(0,174,239,0.12)',   border: 'rgba(0,174,239,0.25)',   glow: 'rgba(0,174,239,0.15)'   },
  green:  { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  glow: 'rgba(16,185,129,0.12)'  },
  purple: { color: '#7C3AED', bg: 'rgba(124,58,237,0.12)',  border: 'rgba(124,58,237,0.25)',  glow: 'rgba(124,58,237,0.12)'  },
  amber:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  glow: 'rgba(245,158,11,0.12)'  },
  cyan:   { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.25)',   glow: 'rgba(6,182,212,0.12)'   },
  pink:   { color: '#EC4899', bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.25)',  glow: 'rgba(236,72,153,0.12)'  },
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className, accent = 'blue' }: Props) {
  const a = accents[accent]

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('relative overflow-hidden rounded-2xl p-5', className)}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: `1px solid ${a.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.2), 0 0 40px ${a.glow}`,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${a.bg} 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {title}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: a.bg, border: `1px solid ${a.border}` }}
          >
            <Icon className="h-5 w-5" style={{ color: a.color }} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-display font-bold text-white tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{subtitle}</p>
          )}
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-1.5">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: trend.value > 0
                  ? 'rgba(16,185,129,0.15)'
                  : trend.value < 0
                    ? 'rgba(239,68,68,0.15)'
                    : 'rgba(255,255,255,0.05)',
                color: trend.value > 0 ? '#10B981' : trend.value < 0 ? '#F87171' : 'rgba(255,255,255,0.4)',
              }}
            >
              {trend.value > 0
                ? <TrendingUp className="h-3 w-3" />
                : trend.value < 0
                  ? <TrendingDown className="h-3 w-3" />
                  : <Minus className="h-3 w-3" />}
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
