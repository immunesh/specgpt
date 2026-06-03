import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  className?: string
  accent?: 'blue' | 'green' | 'purple' | 'amber'
}

const accents = {
  blue: 'text-blue-500 bg-blue-500/10',
  green: 'text-emerald-500 bg-emerald-500/10',
  purple: 'text-purple-500 bg-purple-500/10',
  amber: 'text-amber-500 bg-amber-500/10',
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className, accent = 'blue' }: Props) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn('p-2.5 rounded-xl', accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-1.5">
            {trend.value > 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : trend.value < 0 ? (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={cn('text-xs font-medium', trend.value > 0 ? 'text-emerald-500' : trend.value < 0 ? 'text-red-500' : 'text-muted-foreground')}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
