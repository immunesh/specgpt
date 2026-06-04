import express, { Application, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { v4 as uuidv4 } from 'uuid'

import { config } from './config'
import { logger } from './utils/logger'
import { AppError } from './utils/errors'
import { createApiRouter } from './api/routes'
import { globalRateLimiter } from './api/middleware/rateLimiter'

export function createApp(): Application {
  const app = express()

  // ── Security Headers ─────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", config.frontend.url],
        },
      },
    }),
  )

  // ── CORS ─────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.frontend.url,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    }),
  )

  // ── Request ID ───────────────────────────────────────────────────
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.requestId = (req.headers['x-request-id'] as string) || uuidv4()
    next()
  })

  // ── Body Parsing ─────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(cookieParser())
  app.use(compression({
    filter: (req, res) => {
      if (res.getHeader('Content-Type') === 'text/event-stream') return false
      return compression.filter(req, res)
    },
  }))

  // ── HTTP Logging ─────────────────────────────────────────────────
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
      skip: (req) => req.url === '/health',
    }),
  )

  // ── Global Rate Limiting ─────────────────────────────────────────
  app.use(globalRateLimiter)

  // ── Health Check ─────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: '5g-specgpt-api' })
  })

  // ── API Routes ───────────────────────────────────────────────────
  app.use('/api/v1', createApiRouter())

  // ── 404 Handler ──────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Route not found' })
  })

  // ── Global Error Handler ─────────────────────────────────────────
  app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error', {
      error: error.message,
      stack: config.isDev ? error.stack : undefined,
      requestId: req.requestId,
      path: req.path,
    })

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      })
    }

    // Multer errors
    if (error.name === 'MulterError') {
      return res.status(400).json({
        success: false,
        error: 'File upload error: ' + error.message,
        code: 'UPLOAD_ERROR',
      })
    }

    return res.status(500).json({
      success: false,
      error: config.isProd ? 'Internal server error' : error.message,
    })
  })

  return app
}
