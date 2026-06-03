import { documentQueue, DocumentJobData } from './documentQueue'
import { documentProcessor } from '@/core/rag/DocumentProcessor'
import { logger } from '@/utils/logger'

// Concurrency = 2: process 2 PDFs simultaneously
documentQueue.process(2, async (job) => {
  const { documentId, filePath } = job.data as DocumentJobData

  logger.info('Starting document job', { jobId: job.id, documentId })

  await job.progress(5)
  await documentProcessor.process(documentId, filePath)
  await job.progress(100)
})

logger.info('Document queue worker ready')
