import { PrismaClient } from '@prisma/client'
import { config } from '@/config'
import { logger } from '@/utils/logger'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: config.isDev
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'error' },
        ]
      : [{ emit: 'event', level: 'error' }],
  })
}

export const prisma = globalThis.__prisma ?? createPrismaClient()

if (config.isDev) {
  globalThis.__prisma = prisma

  // Log slow queries in development
  ;(prisma as any).$on('query', (e: { query: string; duration: number }) => {
    if (e.duration > 500) {
      logger.warn('Slow query detected', { query: e.query, duration: e.duration })
    }
  })
}
