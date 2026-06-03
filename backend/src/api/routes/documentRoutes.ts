import { Router } from 'express'
import { documentController } from '@/api/controllers/DocumentController'
import { authenticate } from '@/api/middleware/authenticate'
import { requireAdmin } from '@/api/middleware/requireRole'
import { uploadMiddleware } from '@/api/middleware/upload'
import { validate } from '@/api/middleware/validate'
import { listDocumentsSchema, uploadDocumentSchema } from '@/api/validators/documentValidators'

const router = Router()

// All routes require authentication
router.use(authenticate)

// ── Public (any authenticated user) ──────────────────────────────

// GET /documents — list all ready documents
router.get(
  '/',
  validate(listDocumentsSchema, 'query'),
  documentController.list.bind(documentController),
)

// GET /documents/:id — get single document
router.get('/:id', documentController.getById.bind(documentController))

// GET /documents/:id/status — processing status
router.get('/:id/status', documentController.getJobStatus.bind(documentController))

// ── Admin only ────────────────────────────────────────────────────

// POST /documents/upload — upload new PDF spec
router.post(
  '/upload',
  requireAdmin,
  uploadMiddleware.single('file'),
  validate(uploadDocumentSchema),
  documentController.upload.bind(documentController),
)

// POST /documents/:id/reprocess — re-run RAG pipeline
router.post(
  '/:id/reprocess',
  requireAdmin,
  documentController.reprocess.bind(documentController),
)

// DELETE /documents/:id — remove document + chunks
router.delete(
  '/:id',
  requireAdmin,
  documentController.delete.bind(documentController),
)

export { router as documentRouter }
