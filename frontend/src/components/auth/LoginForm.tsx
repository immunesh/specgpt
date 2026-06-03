'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GoogleAuthButton } from './GoogleAuthButton'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useState } from 'react'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data)
      const { user, accessToken } = res.data.data!
      setAuth(user, accessToken)
      toast.success(`Welcome back, ${user.name}!`)
      router.push('/chat')
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Login failed. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2 lg:hidden">
          <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">5G</span>
          </div>
          <span className="font-bold text-lg">SpecGPT</span>
        </div>
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>Access your 5G specifications assistant</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <GoogleAuthButton />
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
            or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="pl-9"
                autoComplete="email"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-9 pr-9"
                autoComplete="current-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign in
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
