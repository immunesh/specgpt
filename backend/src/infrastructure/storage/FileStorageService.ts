import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { config } from '@/config'
import { logger } from '@/utils/logger'

export interface StoredFile {
  filePath: string
  fileName: string
  fileSize: number
  mimeType: string
}

export class FileStorageService {
  private readonly uploadDir: string

  constructor() {
    this.uploadDir = path.resolve(config.upload.dir)
    this.ensureDir()
  }

  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.uploadDir, { recursive: true })
  }

  // Returns a stable, collision-safe path for an uploaded file
  buildPath(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase()
    const hash = crypto.randomBytes(16).toString('hex')
    const datePart = new Date().toISOString().slice(0, 10)
    return path.join(this.uploadDir, `${datePart}_${hash}${ext}`)
  }

  async readFile(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath)
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
    } catch (err: any) {
      // Ignore already-deleted files
      if (err.code !== 'ENOENT') {
        logger.warn('Failed to delete file', { filePath, error: err.message })
      }
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async getFileSize(filePath: string): Promise<number> {
    const stat = await fs.stat(filePath)
    return stat.size
  }
}

export const fileStorageService = new FileStorageService()
