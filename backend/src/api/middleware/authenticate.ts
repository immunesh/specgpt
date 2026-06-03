import { Request, Response, NextFunction } from 'express'
import { jwtService } from '@/core/auth/JwtService'
import { userRepository } from '@/core/container'
import { AuthenticationError } from '@/utils/errors'

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Authorization header missing or malformed')
    }

    const token = authHeader.slice(7)
    const payload = jwtService.verifyAccessToken(token)

    // Lightweight check — only full DB lookup on sensitive routes
    const user = await userRepository.findById(payload.sub)
    if (!user || !user.isActive) {
      throw new AuthenticationError('Account not found or deactivated')
    }

    req.user = { id: user.id, email: user.email, role: user.role }
    next()
  } catch (err) {
    next(err)
  }
}

// Lightweight variant — no DB hit, trusted for non-sensitive reads
export function authenticateLite(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Authorization header missing or malformed')
    }

    const token = authHeader.slice(7)
    const payload = jwtService.verifyAccessToken(token)
    req.user = { id: payload.sub, email: payload.email, role: payload.role as any }
    next()
  } catch (err) {
    next(err)
  }
}
