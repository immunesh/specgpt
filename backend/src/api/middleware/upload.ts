import multer from 'multer'
import path from 'path'
import { fileStorageService } from '@/infrastructure/storage/FileStorageService'
import { config } from '@/config'
import { ValidationError } from '@/utils/errors'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(config.upload.dir))
  },
  filename: (_req, file, cb) => {
    const safePath = fileStorageService.buildPath(file.originalname)
    cb(null, path.basename(safePath))
  },
})

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if ((config.upload.allowedMimeTypes as readonly string[]).includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ValidationError('Only PDF files are allowed'))
  }
}

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSizeBytes },
  fileFilter,
})
