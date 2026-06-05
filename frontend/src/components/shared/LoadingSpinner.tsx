import { cn } from '@/lib/utils/cn'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 16, md: 24, lg: 40 }

export function LoadingSpinner({ size = 'md', className }: Props) {
  const s = sizes[size]
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('animate-spin', className)}
      aria-label="Loading"
    >
      {/* Track */}
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
      {/* Arc */}
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="url(#spinGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="spinGrad" x1="12" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00AEEF" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  )
}
