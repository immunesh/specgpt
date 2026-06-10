import { documentQueue } from './documentQueue'
import { documentProcessor } from '@/core/rag/DocumentProcessor'
import { logger } from '@/utils/logger'

documentQueue.process(2, async (job: any) => {
  const { documentId, filePath } = job.data
  logger.info('Starting document job', { jobId: job.id, documentId })
  await job.progress(5)
  await documentProcessor.process(documentId, filePath)
  await job.progress(100)
})

logger.info('Document queue worker ready')
