'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTheme } from 'next-themes'
import { User, Lock, Palette, Bell, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
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

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const { updateProfile, changePassword } = useProfile()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
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

  return (
    <div className="flex flex-col h-full overflow-auto">
      <header className="h-14 border-b border-border px-6 flex items-center flex-shrink-0">
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="h-4 w-4" />Security
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="h-4 w-4" />Appearance
              </TabsTrigger>
            </TabsList>

            {/* ── Profile Tab ──────────────────────────────────────── */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Update your name and avatar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar preview */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profileForm.watch('avatar') || user?.avatar || undefined} />
                      <AvatarFallback className="text-lg gradient-brand text-white">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <Badge variant="info" className="mt-1 text-[10px]">{user?.role?.replace('_', ' ')}</Badge>
                    </div>
                  </div>

                  <Separator />

                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Full Name</Label>
                      <Input {...profileForm.register('name')} />
                      {profileForm.formState.errors.name && (
                        <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Avatar URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input {...profileForm.register('avatar')} placeholder="https://…" />
                      {profileForm.formState.errors.avatar && (
                        <p className="text-xs text-destructive">{profileForm.formState.errors.avatar.message}</p>
                      )}
                    </div>
                    <Button type="submit" loading={updateProfile.isPending}>Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Security Tab ─────────────────────────────────────── */}
            <TabsContent value="security">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Verify your current password, then set a new one</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                        <div key={field} className="space-y-1.5">
                          <Label>{field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}</Label>
                          <Input type="password" {...passwordForm.register(field as any)} />
                          {passwordForm.formState.errors[field as keyof PasswordForm] && (
                            <p className="text-xs text-destructive">{(passwordForm.formState.errors[field as keyof PasswordForm] as any)?.message}</p>
                          )}
                        </div>
                      ))}
                      <Button type="submit" variant="outline" loading={changePassword.isPending}>
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sessions</CardTitle>
                    <CardDescription>Manage all active sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await logout()
                        toast.success('All sessions terminated')
                        router.push('/login')
                      }}
                    >
                      <Shield className="h-4 w-4" />
                      Sign Out All Devices
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-destructive/30">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">Delete Account</Button>
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
                          <Button variant="destructive" onClick={() => { setDeleteOpen(false); toast.error('Account deletion requires contacting support.') }}>
                            Delete Account
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Appearance Tab ───────────────────────────────────── */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how 5G SpecGPT looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['light', 'dark', 'system'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`rounded-xl border-2 p-4 text-sm font-medium capitalize transition-all ${
                            theme === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Preferences</Label>
                    {[
                      { id: 'stream', label: 'Streaming responses', description: 'Show AI responses as they are generated' },
                      { id: 'citations', label: 'Auto-expand citations', description: 'Always show source citations expanded' },
                      { id: 'sounds', label: 'Sound effects', description: 'Play a sound when response completes' },
                    ].map(({ id, label, description }) => (
                      <div key={id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        <Switch defaultChecked={id === 'stream'} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
