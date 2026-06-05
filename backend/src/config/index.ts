import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  REDIS_URL: z.string().optional(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  ANTHROPIC_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  CLAUDE_MODEL: z.string().default('llama-3.3-70b-versatile'),
  CLAUDE_MAX_TOKENS: z.string().default('4096').transform(Number),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  FRONTEND_URL: z.string().default('http://localhost:3000'),

  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.string().default('50').transform(Number),

  VOYAGE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  EMBEDDING_PROVIDER: z.enum(['voyage', 'openai']).default('voyage'),
  EMBEDDING_MODEL: z.string().default('voyage-large-2'),
  EMBEDDING_DIMENSIONS: z.string().default('1024').transform(Number),

  RATE_LIMIT_WINDOW_MS: z.string().default('60000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
  CHAT_RATE_LIMIT_MAX: z.string().default('20').transform(Number),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:')
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  })
  process.exit(1)
}

export const config = {
  env: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  isDev: parsed.data.NODE_ENV === 'development',
  isProd: parsed.data.NODE_ENV === 'production',

  database: {
    url: parsed.data.DATABASE_URL,
  },

  redis: {
    url: parsed.data.REDIS_URL,
  },

  jwt: {
    secret: parsed.data.JWT_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN,
    refreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  },

  anthropic: {
    apiKey: parsed.data.ANTHROPIC_API_KEY ?? '',
    model: parsed.data.CLAUDE_MODEL,
    maxTokens: parsed.data.CLAUDE_MAX_TOKENS,
  },

  groq: {
    apiKey: parsed.data.GROQ_API_KEY ?? '',
    model: parsed.data.GROQ_MODEL,
  },

  google: {
    clientId: parsed.data.GOOGLE_CLIENT_ID,
    clientSecret: parsed.data.GOOGLE_CLIENT_SECRET,
  },

  frontend: {
    url: parsed.data.FRONTEND_URL,
  },

  upload: {
    dir: parsed.data.UPLOAD_DIR,
    maxFileSizeMb: parsed.data.MAX_FILE_SIZE_MB,
    maxFileSizeBytes: parsed.data.MAX_FILE_SIZE_MB * 1024 * 1024,
    allowedMimeTypes: ['application/pdf'],
  },

  embedding: {
    provider: parsed.data.EMBEDDING_PROVIDER,
    model: parsed.data.EMBEDDING_MODEL,
    dimensions: parsed.data.EMBEDDING_DIMENSIONS,
    voyageApiKey: parsed.data.VOYAGE_API_KEY,
    openaiApiKey: parsed.data.OPENAI_API_KEY,
  },

  rateLimit: {
    windowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
    maxRequests: parsed.data.RATE_LIMIT_MAX_REQUESTS,
    chatMax: parsed.data.CHAT_RATE_LIMIT_MAX,
  },
} as const

export type Config = typeof config
