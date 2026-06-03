import { describe, it, expect, beforeAll } from 'vitest'

// Minimal env setup before importing config
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.JWT_SECRET = 'test_jwt_secret_that_is_at_least_32_characters_long'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_at_least_32_chars_long'
process.env.ANTHROPIC_API_KEY = 'test-key'

import { JwtService } from '../JwtService'
import { AuthenticationError } from '@/utils/errors'

const jwt = new JwtService()

describe('JwtService', () => {
  const payload = { sub: 'user-123', email: 'test@example.com', role: 'USER' }

  it('generates and verifies access tokens', () => {
    const token = jwt.generateAccessToken(payload)
    const verified = jwt.verifyAccessToken(token)
    expect(verified.sub).toBe(payload.sub)
    expect(verified.email).toBe(payload.email)
    expect(verified.type).toBe('access')
  })

  it('generates and verifies refresh tokens', () => {
    const { token, jti } = jwt.generateRefreshToken(payload.sub)
    const verified = jwt.verifyRefreshToken(token)
    expect(verified.sub).toBe(payload.sub)
    expect(verified.jti).toBe(jti)
    expect(verified.type).toBe('refresh')
  })

  it('rejects tampered access tokens', () => {
    const token = jwt.generateAccessToken(payload)
    const tampered = token.slice(0, -5) + 'XXXXX'
    expect(() => jwt.verifyAccessToken(tampered)).toThrow(AuthenticationError)
  })

  it('hashes tokens consistently', () => {
    const token = 'some-raw-token'
    expect(jwt.hashToken(token)).toBe(jwt.hashToken(token))
    expect(jwt.hashToken(token)).not.toBe(token)
  })

  it('returns future expiry date for refresh tokens', () => {
    const expiry = jwt.getRefreshTokenExpiry()
    expect(expiry.getTime()).toBeGreaterThan(Date.now())
  })
})
