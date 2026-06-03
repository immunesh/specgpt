import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from '@/config'
import { AuthenticationError } from '@/utils/errors'

export interface AccessTokenPayload {
  sub: string // userId
  email: string
  role: string
  type: 'access'
}

export interface RefreshTokenPayload {
  sub: string
  jti: string // unique token id — matched against DB hash
  type: 'refresh'
}

export class JwtService {
  generateAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'access' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn, algorithm: 'HS256' },
    )
  }

  generateRefreshToken(userId: string): { token: string; jti: string } {
    const jti = crypto.randomUUID()
    const token = jwt.sign(
      { sub: userId, jti, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn, algorithm: 'HS256' },
    )
    return { token, jti }
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as AccessTokenPayload
      if (payload.type !== 'access') throw new Error('Wrong token type')
      return payload
    } catch (err) {
      throw new AuthenticationError('Invalid or expired access token')
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload
      if (payload.type !== 'refresh') throw new Error('Wrong token type')
      return payload
    } catch (err) {
      throw new AuthenticationError('Invalid or expired refresh token')
    }
  }

  // Hash token for safe DB storage (never store raw JWTs)
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  getRefreshTokenExpiry(): Date {
    // 7d default
    const ms = this.parseDuration(config.jwt.refreshExpiresIn)
    return new Date(Date.now() + ms)
  }

  private parseDuration(str: string): number {
    const units: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    }
    const match = str.match(/^(\d+)([smhd])$/)
    if (!match) return 7 * 86_400_000
    return parseInt(match[1]) * (units[match[2]] ?? 86_400_000)
  }
}

export const jwtService = new JwtService()
