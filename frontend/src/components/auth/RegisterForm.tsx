'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleAuthButton } from './GoogleAuthButton'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'
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

const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981']
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

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

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register({ name: data.name, email: data.email, password: data.password })
      const { user, accessToken } = res.data.data!
      setAuth(user, accessToken)
      toast.success('Account created successfully!')
      router.push('/chat')
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Registration failed. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="rounded-2xl p-8 space-y-5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00AEEF, #0070F3)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/50 text-xs font-medium uppercase tracking-widest">5G SpecGPT</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Create account</h1>
          <p className="text-white/50 text-sm">Join the Capgemini 5G knowledge platform</p>
        </div>

        {/* Google OAuth */}
        <GoogleAuthButton label="Sign up with Google" />

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs font-medium">or create with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/70 text-sm font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                id="name"
                placeholder="Alex Smith"
                className="pl-10 h-11 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-[#00AEEF]/60 focus:ring-[#00AEEF]/20 rounded-xl"
                {...register('name')}
              />
            </div>
            {errors.name && <p className="text-red-400/80 text-xs">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/70 text-sm font-medium">Work Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                id="email"
                type="email"
                placeholder="you@capgemini.com"
                className="pl-10 h-11 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-[#00AEEF]/60 focus:ring-[#00AEEF]/20 rounded-xl"
                autoComplete="email"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-red-400/80 text-xs">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70 text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-[#00AEEF]/60 focus:ring-[#00AEEF]/20 rounded-xl"
                autoComplete="new-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {password && (
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)' }}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/40">
                  Strength:{' '}
                  <span style={{ color: strengthColors[strength] }} className="font-medium">
                    {strengthLabels[strength]}
                  </span>
                </p>
              </div>
            )}
            {errors.password && <p className="text-red-400/80 text-xs">{errors.password.message}</p>}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/70 text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                id="confirmPassword"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 h-11 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-[#00AEEF]/60 focus:ring-[#00AEEF]/20 rounded-xl"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-400/80 text-xs">{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: isSubmitting
                  ? 'rgba(0,174,239,0.4)'
                  : 'linear-gradient(135deg, #00AEEF 0%, #0070F3 100%)',
                boxShadow: isSubmitting ? 'none' : '0 0 20px rgba(0,174,239,0.3), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        </form>

        <p className="text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link href="/login" className="text-[#00AEEF]/80 hover:text-[#00AEEF] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
