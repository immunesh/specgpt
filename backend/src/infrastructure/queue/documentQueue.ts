import Bull from 'bull'
import { config } from '@/config'
import { logger } from '@/utils/logger'

export interface DocumentJobData {
  documentId: string
  filePath: string
  userId: string
}

const queueOptions: Bull.QueueOptions = config.redis.url
  ? { redis: config.redis.url }
  : {
      // In-memory fallback when Redis is unavailable (dev without Docker)
      redis: { host: 'localhost', port: 6379, maxRetriesPerRequest: 1 },
    }

export const documentQueue = new Bull<DocumentJobData>('document-processing', {
  ...queueOptions,
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
