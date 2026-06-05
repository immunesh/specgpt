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
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
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
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Login failed. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Glass card */}
      <div
        className="rounded-2xl p-8 space-y-6"
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

          <h1 className="text-2xl font-display font-bold text-white">Welcome back</h1>
          <p className="text-white/50 text-sm">Sign in to your Capgemini workspace</p>
        </div>

        {/* Google OAuth */}
        <div>
          <GoogleAuthButton />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs font-medium">or continue with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/70 text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                id="email"
                type="email"
                placeholder="you@capgemini.com"
                className="pl-10 h-11 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-[#00AEEF]/60 focus:ring-[#00AEEF]/20 rounded-xl transition-all"
                autoComplete="email"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-red-400/80 text-xs">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/70 text-sm font-medium">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#00AEEF]/80 hover:text-[#00AEEF] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-[#00AEEF]/60 focus:ring-[#00AEEF]/20 rounded-xl transition-all"
                autoComplete="current-password"
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
            {errors.password && (
              <p className="text-red-400/80 text-xs">{errors.password.message}</p>
            )}
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
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-white/40">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#00AEEF]/80 hover:text-[#00AEEF] font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
