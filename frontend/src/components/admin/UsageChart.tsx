'use client'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { format, parseISO } from 'date-fns'
import { DailyUsageStat } from '@/lib/api/admin'

interface Props {
  data: DailyUsageStat[]
  isLoading?: boolean
}

function SkeletonChart() {
  return (
    <div className="h-64 flex items-end gap-1 px-2">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 shimmer rounded-t"
          style={{ height: `${20 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  )
}

export function MessagesChart({ data, isLoading }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const axisColor = isDark ? '#6b7280' : '#9ca3af'
  const gridColor = isDark ? '#374151' : '#f3f4f6'

  const formatted = data.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Messages</CardTitle>
        <CardDescription>Messages and conversations over time</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <SkeletonChart /> : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0e93e8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0e93e8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradConvs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: isDark ? '#f9fafb' : '#111827', fontWeight: 600 }}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="messages" name="Messages" stroke="#0e93e8" strokeWidth={2} fill="url(#gradMessages)" dot={false} />
              <Area type="monotone" dataKey="conversations" name="Conversations" stroke="#10b981" strokeWidth={2} fill="url(#gradConvs)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function TokensChart({ data, isLoading }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const axisColor = isDark ? '#6b7280' : '#9ca3af'
  const gridColor = isDark ? '#374151' : '#f3f4f6'

  const formatted = data.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
    totalTokens: Math.round(d.totalTokens / 1000), // show in K
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Token Usage</CardTitle>
        <CardDescription>Total tokens consumed per day (thousands)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <SkeletonChart /> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} unit="K" />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v}K tokens`, 'Tokens']}
              />
              <Bar dataKey="totalTokens" name="Tokens (K)" fill="#0e93e8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function UsersChart({ data, isLoading }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const axisColor = isDark ? '#6b7280' : '#9ca3af'
  const gridColor = isDark ? '#374151' : '#f3f4f6'

  const formatted = data.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active Users</CardTitle>
        <CardDescription>Unique users per day</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <SkeletonChart /> : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="uniqueUsers" name="Active Users" stroke="#a855f7" strokeWidth={2} fill="url(#gradUsers)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
