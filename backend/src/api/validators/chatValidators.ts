import { z } from 'zod'

export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message too long (max 4000 characters)')
    .trim(),
  conversationId: z.string().uuid('Invalid conversation ID').optional(),
  stream: z.boolean().default(true),
})

export const listConversationsSchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('20').transform(Number),
  archived: z.string().optional().transform((v) => v === 'true'),
})

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  isPinned: z.boolean().optional(),
})

export const searchSchema = z.object({
  q: z.string().min(2, 'Search query too short').max(500).trim(),
  limit: z.string().default('10').transform(Number),
  minScore: z.string().default('0.3').transform(Number),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type ListConversationsInput = z.infer<typeof listConversationsSchema>
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>
export type SearchInput = z.infer<typeof searchSchema>
