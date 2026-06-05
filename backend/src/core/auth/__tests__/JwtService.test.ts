import { describe, it, expect, beforeAll } from 'vitest'
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
