'use client'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { DailyUsageStat } from '@/lib/api/admin'

interface Props {
  data: DailyUsageStat[]
  isLoading?: boolean
}

const AXIS_COLOR = 'rgba(255,255,255,0.2)'
const GRID_COLOR = 'rgba(255,255,255,0.05)'
const TOOLTIP_STYLE = {
  backgroundColor: '#0D1629',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  fontSize: 12,
  color: 'rgba(255,255,255,0.9)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
}
const LABEL_STYLE = { color: 'rgba(255,255,255,0.7)', fontWeight: 600 }

function SkeletonChart() {
  return (
    <div className="h-56 flex items-end gap-1 px-2 py-4">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t shimmer"
          style={{ height: `${25 + Math.random() * 55}%` }}
        />
      ))}
    </div>
  )
}

function ChartHeader({ title, subtitle, color }: { title: string; subtitle: string; color: string }) {
  return (
    <div className="flex items-start justify-between px-5 pt-5 pb-4">
      <div>
        <h3 className="text-sm font-semibold text-white/85">{title}</h3>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{subtitle}</p>
      </div>
      <div
        className="w-2 h-2 rounded-full mt-1.5 animate-pulse"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
    </div>
  )
}

export function MessagesChart({ data, isLoading }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <div>
      <ChartHeader
        title="Daily Messages"
        subtitle="Messages and conversations over time"
        color="#00AEEF"
      />
      {isLoading ? <SkeletonChart /> : (
        <ResponsiveContainer width="100%" height={224}>
          <AreaChart data={formatted} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gradMessages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00AEEF" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00AEEF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradConvs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} />
            <Legend
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8, color: 'rgba(255,255,255,0.45)' }}
            />
            <Area type="monotone" dataKey="messages"      name="Messages"       stroke="#00AEEF" strokeWidth={2} fill="url(#gradMessages)" dot={false} activeDot={{ r: 4, fill: '#00AEEF' }} />
            <Area type="monotone" dataKey="conversations" name="Conversations"  stroke="#10B981" strokeWidth={2} fill="url(#gradConvs)"    dot={false} activeDot={{ r: 4, fill: '#10B981' }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function TokensChart({ data, isLoading }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
    totalTokens: Math.round(d.totalTokens / 1000),
  }))

  return (
    <div>
      <ChartHeader
        title="Token Usage"
        subtitle="Total tokens consumed per day (thousands)"
        color="#7C3AED"
      />
      {isLoading ? <SkeletonChart /> : (
        <ResponsiveContainer width="100%" height={224}>
          <BarChart data={formatted} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTokenBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7C3AED" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0070F3" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} unit="K" />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={LABEL_STYLE}
              formatter={(v: number) => [`${v}K tokens`, 'Tokens']}
            />
            <Bar dataKey="totalTokens" name="Tokens (K)" fill="url(#gradTokenBar)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function UsersChart({ data, isLoading }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <div>
      <ChartHeader
        title="Active Users"
        subtitle="Unique users active per day"
        color="#EC4899"
      />
      {isLoading ? <SkeletonChart /> : (
        <ResponsiveContainer width="100%" height={224}>
          <AreaChart data={formatted} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#EC4899" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} />
            <Area type="monotone" dataKey="uniqueUsers" name="Active Users" stroke="#EC4899" strokeWidth={2} fill="url(#gradUsers)" dot={false} activeDot={{ r: 4, fill: '#EC4899' }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
