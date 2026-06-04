import { Request, Response, NextFunction } from 'express'
import { documentService } from '@/domain/services/DocumentService'
import { ListDocumentsInput, UploadDocumentInput } from '@/api/validators/documentValidators'
import { ValidationError } from '@/utils/errors'

export class DocumentController {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new ValidationError('No file uploaded')
      }

      const body = req.body as UploadDocumentInput
      const document = await documentService.upload({
        file: req.file,
        userId: req.user!.id,
        specNumber: body.specNumber,
        specTitle: body.specTitle,
        series: body.series,
        release: body.release,
      })

      res.status(202).json({
        success: true,
        message: 'Document uploaded and queued for processing',
        data: document,
      })
    } catch (err) {
      next(err)
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListDocumentsInput
      const result = await documentService.list({
        page: Number(query.page) || 1,
        limit: Math.min(Number(query.limit) || 20, 100),
        status: query.status,
        series: query.series,
        release: query.release,
        search: query.search,
      })

      res.json({
        success: true,
        data: result.documents,
        meta: {
          total: result.total,
          totalPages: result.totalPages,
          page: Number(query.page) || 1,
          limit: Number(query.limit) || 20,
        },
      })
    } catch (err) {
      next(err)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string
      const doc = await documentService.getById(id)
      res.json({ success: true, data: doc })
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string
      await documentService.delete(id)
      res.json({ success: true, message: 'Document deleted' })
    } catch (err) {
      next(err)
    }
  }

  async reprocess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string
      const doc = await documentService.reprocess(id, req.user!.id)
      res.json({
        success: true,
        message: 'Document requeued for processing',
        data: doc,
      })
    } catch (err) {
      next(err)
    }
  }

  async getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string
      const status = await documentService.getJobStatus(id)
      res.json({ success: true, data: status })
    } catch (err) {
      next(err)
    }
  }
}

export const documentController = new DocumentController()
