import rateLimit from 'express-rate-limit'
import { config } from '@/config'

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skip: (req) => req.url === '/health',
})

export const chatRateLimiter = rateLimit({
  windowMs: 60_000,
  max: config.rateLimit.chatMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? 'anonymous',
  message: {
    success: false,
    error: 'Chat rate limit exceeded. Please wait before sending more messages.',
    code: 'CHAT_RATE_LIMIT_EXCEEDED',
  },
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60_000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please wait 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
})
