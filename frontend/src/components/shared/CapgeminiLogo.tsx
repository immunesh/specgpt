import { cn } from '@/lib/utils/cn'

interface Props {
  className?: string
  /** When true, applies a white filter so the dark-blue logo reads on dark backgrounds */
  light?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

/* Height in px — width scales via aspect ratio (~4.75 : 1) */
const heights: Record<NonNullable<Props['size']>, number> = {
  xs: 56,
  sm: 80,
  md: 112,
  lg: 144,
  xl: 192,
}

export function CapgeminiLogo({ className, light = false, size = 'md' }: Props) {
  const h = heights[size]

  return (
    <span className={cn('inline-flex items-center select-none shrink-0', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/capgemini-logo.svg"
        alt="Capgemini"
        height={h}
        style={{
          height: h,
          width: 'auto',
          display: 'block',
          /* Invert the dark-blue SVG paths to white on dark surfaces */
          filter: light ? 'brightness(0) invert(1)' : undefined,
        }}
        draggable={false}
      />
    </span>
  )
}

/**
 * Two-line badge: official Capgemini logo + "5G SpecGPT" sub-label.
 */
export function CapgeminiSpecGPTBadge({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn('flex flex-col items-start gap-0.5', className)}>
      <CapgeminiLogo light={light} size="sm" />
      <span
        style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: light ? 'rgba(255,255,255,0.4)' : '#6B7280',
          marginLeft: 2,
        }}
      >
        5G SpecGPT
      </span>
    </div>
  )
}
