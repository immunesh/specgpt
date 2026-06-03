import { z } from 'zod'

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255)
    .toLowerCase()
    .trim(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

export const googleAuthSchema = z.object({
  idToken: z.string().optional(),
  code: z.string().optional(),
  redirectUri: z.string().url().optional(),
}).refine(
  (data) => data.idToken || (data.code && data.redirectUri),
  { message: 'Either idToken or code+redirectUri is required' },
)

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  avatar: z.string().url().max(500).optional().nullable(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
