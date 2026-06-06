import Bull from 'bull'
import { config } from '@/config'
import { logger } from '@/utils/logger'

export interface DocumentJobData {
  documentId: string
  filePath: string
  userId: string
}

function getRedisOptions(): Bull.QueueOptions {
  const url = config.redis.url
  if (!url) {
    return { redis: { host: 'localhost', port: 6379, maxRetriesPerRequest: 1 } }
  }
  const parsed = new URL(url)
  const isTls = url.startsWith('rediss://')
  return {
    redis: {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379'),
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      tls: isTls ? {} : undefined,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
    },
  }
}

export const documentQueue = new Bull<DocumentJobData>('document-processing', {
  ...getRedisOptions(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})

documentQueue.on('error', (err) => {
  logger.error('Document queue error', { error: err.message })
})

documentQueue.on('failed', (job, err) => {
  logger.error('Document job failed', {
    jobId: job.id,
    documentId: job.data.documentId,
    attempt: job.attemptsMade,
    error: err.message,
  })
})

documentQueue.on('completed', (job) => {
  logger.info('Document job completed', {
    jobId: job.id,
    documentId: job.data.documentId,
  })
})
