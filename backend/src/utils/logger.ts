import winston from 'winston'
import { config } from '@/config'

const { combine, timestamp, errors, json, colorize, simple } = winston.format

export const logger = winston.createLogger({
  level: config.isDev ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json(),
  ),
  defaultMeta: { service: '5g-specgpt-api' },
  transports: [
    new winston.transports.Console({
      format: config.isDev ? combine(colorize(), simple()) : combine(timestamp(), json()),
    }),
  ],
})

if (config.isProd) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  )
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  )
}
