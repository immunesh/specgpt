'use client'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="h-7 w-7 rounded-lg flex items-center justify-center transition-all relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <motion.div
        animate={{ rotate: isDark ? 0 : 180, opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon className="h-3.5 w-3.5" style={{ color: '#5BB8D4' }} />
      </motion.div>
      <motion.div
        animate={{ rotate: isDark ? -180 : 0, opacity: isDark ? 0 : 1, scale: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun className="h-3.5 w-3.5" style={{ color: '#F59E0B' }} />
      </motion.div>
    </motion.button>
  )
}
