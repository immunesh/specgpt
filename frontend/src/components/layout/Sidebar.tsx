'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, History, Search, Settings, Shield,
  LogOut, BarChart3, Users, FileText, Plus, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeToggle } from './ThemeToggle'
import { useAuthStore } from '@/store/authStore'
import { CapgeminiLogo } from '@/components/shared/CapgeminiLogo'
import { ConversationList } from '@/components/chat/ConversationList'

const navItems = [
  { href: '/chat',    label: 'Chat',        icon: MessageSquare, color: '#00AEEF' },
  { href: '/history', label: 'History',     icon: History,       color: '#5BB8D4' },
  { href: '/search',  label: 'Spec Search', icon: Search,        color: '#7C3AED' },
  { href: '/settings',label: 'Settings',    icon: Settings,      color: '#6B7280' },
]

const adminItems = [
  { href: '/admin',           label: 'Overview',  icon: Shield,    color: '#00AEEF' },
  { href: '/admin/users',     label: 'Users',     icon: Users,     color: '#10B981' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, color: '#F59E0B' },
  { href: '/admin/documents', label: 'Documents', icon: FileText,  color: '#EC4899' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    router.push('/')
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U'

  const isOnChat = pathname === '/chat' || pathname.startsWith('/chat/')

  return (
    <aside
      className="flex flex-col w-64 min-h-screen relative"
      style={{
        background: 'linear-gradient(180deg, #070D1C 0%, #0A1428 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Subtle top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(0,174,239,0.12) 0%, transparent 70%)' }}
      />

      {/* ─── Logo ─── */}
      <div
        className="flex items-center px-4 h-32 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <CapgeminiLogo light size="md" />
      </div>

      {/* ─── New Chat button ─── */}
      <div className="px-3 py-3 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/chat')}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(0,174,239,0.15) 0%, rgba(0,112,243,0.15) 100%)',
            border: '1px solid rgba(0,174,239,0.25)',
            color: '#00AEEF',
          }}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </motion.button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* ─── Main nav ─── */}
        <nav className="space-y-0.5 mb-4">
          {navItems.map(({ href, label, icon: Icon, color }) => {
            const active = pathname === href || (href !== '/chat' && pathname.startsWith(href + '/'))
              || (href === '/chat' && isOnChat)
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative',
                    active
                      ? 'text-white'
                      : 'text-white/45 hover:text-white/80',
                  )}
                  style={active ? {
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  } : {
                    background: 'transparent',
                    border: '1px solid transparent',
                  }}
                >
                  {/* Active left bar */}
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ background: color }}
                    />
                  )}

                  <div
                    className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all')}
                    style={{
                      background: active
                        ? `${color}20`
                        : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{ color: active ? color : undefined }}
                    />
                  </div>
                  <span>{label}</span>

                  {active && (
                    <ChevronRight className="h-3 w-3 ml-auto opacity-40" />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* ─── Conversation list (only on chat pages) ─── */}
        <AnimatePresence>
          {isOnChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div
                className="mx-1 mb-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Conversations
                </p>
              </div>
              <div className="text-white/60">
                <ConversationList showSearch={false} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Admin section ─── */}
        {isAdmin && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-3 py-2 mt-1">
              <Shield className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.25)' }} />
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Admin
              </span>
            </div>
            <nav className="space-y-0.5">
              {adminItems.map(({ href, label, icon: Icon, color }) => {
                const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
                return (
                  <Link key={href} href={href}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative',
                        active ? 'text-white' : 'text-white/45 hover:text-white/80',
                      )}
                      style={active ? {
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      } : {
                        background: 'transparent',
                        border: '1px solid transparent',
                      }}
                    >
                      {active && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                          style={{ background: color }}
                        />
                      )}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: active ? `${color}20` : 'rgba(255,255,255,0.05)' }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: active ? color : undefined }} />
                      </div>
                      <span>{label}</span>
                    </motion.div>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </ScrollArea>

      {/* ─── User footer ─── */}
      <div
        className="flex-shrink-0 p-3 space-y-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 p-2 rounded-xl transition-all hover:bg-white/5">
          <Avatar className="h-8 w-8 flex-shrink-0 ring-2" style={{ '--tw-ring-color': 'rgba(0,174,239,0.3)' } as React.CSSProperties}>
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #00AEEF, #0070F3)' }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate">{user?.name}</p>
            <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/15"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5 text-white/30 hover:text-red-400 transition-colors" />
            </motion.button>
          </div>
        </div>
      </div>
    </aside>
  )
}
