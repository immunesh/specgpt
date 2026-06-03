import { z } from 'zod'
import { UserRole } from '@prisma/client'

export const listUsersSchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('20').transform(Number),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().max(100).optional(),
})

export const updateUserSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(2).max(100).trim().optional(),
})

export const dailyAnalyticsSchema = z.object({
  days: z.string().default('30').transform(Number),
})

export const topUsersSchema = z.object({
  limit: z.string().default('10').transform(Number),
})

export type ListUsersInput = z.infer<typeof listUsersSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
