import { UserRole } from '@5g-specgpt/shared'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: UserRole
      }
      requestId?: string
    }
  }
}
