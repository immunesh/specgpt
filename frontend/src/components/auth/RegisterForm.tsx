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
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const password = watch('password', '')

  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
  ].filter(Boolean).length

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'][strength]

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register({ name: data.name, email: data.email, password: data.password })
      const { user, accessToken } = res.data.data!
      setAuth(user, accessToken)
      toast.success('Account created successfully!')
      router.push('/chat')
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Registration failed. Please try again.'
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
        <CardTitle className="text-2xl font-bold">Create account</CardTitle>
        <CardDescription>Start exploring 5G specifications with AI</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <GoogleAuthButton label="Sign up with Google" />
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
            or create with email
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="name" placeholder="Alex Smith" className="pl-9" {...register('name')} />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Work Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@company.com" className="pl-9" autoComplete="email" {...register('email')} />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-9 pr-9"
                autoComplete="new-password"
                {...register('password')}
              />
              <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-muted'}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Password strength: <span className="font-medium">{strengthLabel}</span></p>
              </div>
            )}
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="confirmPassword" type={showPass ? 'text' : 'password'} placeholder="••••••••" className="pl-9" autoComplete="new-password" {...register('confirmPassword')} />
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create Account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
