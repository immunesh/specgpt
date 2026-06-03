'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  MessageSquare, History, Search, Settings, Shield,
  LogOut, BarChart3, Users, FileText, ChevronRight, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from './ThemeToggle'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/history', label: 'History', icon: History },
  { href: '/search', label: 'Spec Search', icon: Search },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const adminItems = [
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    router.push('/login')
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U'

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">5G</span>
        </div>
        <div>
          <p className="font-bold text-sm leading-none">SpecGPT</p>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">5G Standards AI</p>
        </div>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sm"
          onClick={() => router.push('/chat')}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* Main nav */}
        <nav className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="flex items-center gap-2 px-3 py-2 mt-4">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</span>
            </div>
            <nav className="space-y-0.5">
              {adminItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    pathname.startsWith(href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </>
        )}
      </ScrollArea>

      {/* User footer */}
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage src={user?.avatar ?? undefined} />
              <AvatarFallback className="text-xs gradient-brand text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
