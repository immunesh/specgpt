'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Palette, Shield, Settings, Save, LogOut, Sun, Moon, Monitor, Check, AlertTriangle } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/hooks/useProfile'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState } from 'react'

const profileSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  avatar: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8).regex(/[A-Z]/, 'Uppercase required').regex(/[0-9]/, 'Number required'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

const TABS = [
  { id: 'profile',    label: 'Profile',    icon: User,    color: '#00AEEF' },
  { id: 'security',   label: 'Security',   icon: Lock,    color: '#10B981' },
  { id: 'appearance', label: 'Appearance', icon: Palette, color: '#7C3AED' },
]

function DarkInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div className="space-y-1">
      <input
        {...props}
        className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all placeholder:text-white/20"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)'}`,
          color: 'rgba(255,255,255,0.85)',
        }}
      />
      {error && <p className="text-[11px]" style={{ color: '#F87171' }}>{error}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
    >
      <h3 className="text-sm font-semibold text-white/80">{title}</h3>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const { updateProfile, changePassword } = useProfile()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [deleteOpen, setDeleteOpen] = useState(false)

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', avatar: user?.avatar ?? '' },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfile.mutate({ name: data.name, avatar: data.avatar || null })
  }

  const onPasswordSubmit = (data: PasswordForm) => {
    changePassword.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword })
  }

  const activeColor = TABS.find((t) => t.id === activeTab)?.color ?? '#00AEEF'

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
            style={{ background: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.3)' }}
          >
            <Settings className="h-4 w-4" style={{ color: '#9CA3AF' }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-sm font-semibold text-white/90">Settings</h1>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Manage your account and preferences</p>
          </motion.div>
        </div>

        {/* User role pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(0,174,239,0.08)',
            border: '1px solid rgba(0,174,239,0.2)',
            color: '#5BB8D4',
          }}
        >
          <Shield className="h-3.5 w-3.5" />
          {user?.role?.replace('_', ' ')}
        </motion.div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* ─── Tab bar ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-1 p-1 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {TABS.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="relative flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-medium transition-all"
                style={{ color: activeTab === id ? 'white' : 'rgba(255,255,255,0.4)' }}
              >
                {activeTab === id && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: activeTab === id ? color : undefined }} />
                  {label}
                </span>
              </button>
            ))}
          </motion.div>

          {/* ─── Tab content ─── */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <Section title="Your Profile">
                  {/* Avatar row */}
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={profileForm.watch('avatar') || user?.avatar || undefined} />
                      <AvatarFallback
                        className="text-lg font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #00AEEF, #0070F3)' }}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-white/85">{user?.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email}</p>
                      <span
                        className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,174,239,0.1)', border: '1px solid rgba(0,174,239,0.2)', color: '#5BB8D4' }}
                      >
                        {user?.role?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/50">Full Name</label>
                      <DarkInput
                        {...profileForm.register('name')}
                        error={profileForm.formState.errors.name?.message}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/50">
                        Avatar URL <span style={{ color: 'rgba(255,255,255,0.25)' }}>(optional)</span>
                      </label>
                      <DarkInput
                        {...profileForm.register('avatar')}
                        placeholder="https://…"
                        error={profileForm.formState.errors.avatar?.message}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, #00AEEF, #0070F3)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(0,174,239,0.25)',
                      }}
                    >
                      {updateProfile.isPending
                        ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : <Save className="h-3.5 w-3.5" />
                      }
                      Save Changes
                    </motion.button>
                  </form>
                </Section>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <Section title="Change Password">
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    {[
                      { field: 'currentPassword' as const, label: 'Current Password' },
                      { field: 'newPassword' as const, label: 'New Password' },
                      { field: 'confirmPassword' as const, label: 'Confirm New Password' },
                    ].map(({ field, label }) => (
                      <div key={field} className="space-y-1.5">
                        <label className="text-xs text-white/50">{label}</label>
                        <DarkInput
                          type="password"
                          {...passwordForm.register(field)}
                          error={(passwordForm.formState.errors[field] as { message?: string })?.message}
                        />
                      </div>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={changePassword.isPending}
                      className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                      style={{
                        background: 'rgba(16,185,129,0.15)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10B981',
                      }}
                    >
                      {changePassword.isPending
                        ? <span className="h-4 w-4 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                        : <Check className="h-3.5 w-3.5" />
                      }
                      Update Password
                    </motion.button>
                  </form>
                </Section>

                <Section title="Sessions">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/75">Sign out all devices</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Terminates all active sessions immediately
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        await logout()
                        toast.success('All sessions terminated')
                        router.push('/')
                      }}
                      className="flex items-center gap-2 h-8 px-3 rounded-xl text-xs font-medium transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out All
                    </motion.button>
                  </div>
                </Section>

                {/* Danger Zone */}
                <div
                  className="rounded-2xl p-5 space-y-4"
                  style={{ border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(239,68,68,0.03)' }}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" style={{ color: '#F87171' }} />
                    <h3 className="text-sm font-semibold" style={{ color: '#F87171' }}>Danger Zone</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/75">Delete account</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Permanently deletes all data — cannot be undone
                      </p>
                    </div>
                    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                      <DialogTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 h-8 px-3 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}
                        >
                          Delete Account
                        </motion.button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete your account?</DialogTitle>
                          <DialogDescription>
                            This will permanently delete all your conversations, messages, and profile data. This cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                          <Button
                            variant="destructive"
                            onClick={() => { setDeleteOpen(false); toast.error('Account deletion requires contacting support.') }}
                          >
                            Delete Account
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <Section title="Theme">
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: 'light',  label: 'Light',  icon: Sun,     preview: 'bg-white border-gray-200' },
                      { id: 'dark',   label: 'Dark',   icon: Moon,    preview: 'bg-gray-900 border-gray-700' },
                      { id: 'system', label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-white to-gray-900 border-gray-400' },
                    ] as const).map(({ id, label, icon: Icon }) => {
                      const active = theme === id
                      return (
                        <motion.button
                          key={id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setTheme(id)}
                          className="relative flex flex-col items-center justify-center gap-2 py-5 rounded-2xl transition-all"
                          style={{
                            background: active ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                            border: active ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          {active && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ background: '#7C3AED' }}
                            >
                              <Check className="h-2.5 w-2.5 text-white" />
                            </motion.div>
                          )}
                          <Icon className="h-5 w-5" style={{ color: active ? '#A78BFA' : 'rgba(255,255,255,0.4)' }} />
                          <span
                            className="text-xs font-medium capitalize"
                            style={{ color: active ? '#A78BFA' : 'rgba(255,255,255,0.5)' }}
                          >
                            {label}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </Section>

                <Section title="Preferences">
                  <div className="space-y-0.5">
                    {[
                      { id: 'stream',    label: 'Streaming responses',   desc: 'Show AI responses as they are generated', checked: true  },
                      { id: 'citations', label: 'Auto-expand citations',  desc: 'Always show source citations expanded',   checked: false },
                      { id: 'sounds',    label: 'Sound effects',          desc: 'Play a sound when response completes',    checked: false },
                    ].map(({ id, label, desc, checked }, i, arr) => (
                      <div
                        key={id}
                        className="flex items-center justify-between py-3 px-1"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                      >
                        <div>
                          <p className="text-sm text-white/75">{label}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
                        </div>
                        <Switch defaultChecked={checked} />
                      </div>
                    ))}
                  </div>
                </Section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
