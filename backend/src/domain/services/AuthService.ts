import { User } from '@prisma/client'
import { prisma } from '@/infrastructure/database/client'
import { userRepository } from '@/core/container'
import { jwtService } from '@/core/auth/JwtService'
import { passwordService } from '@/core/auth/PasswordService'
import { googleOAuthService, GoogleUserInfo } from '@/core/auth/GoogleOAuthService'
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
  NotFoundError,
} from '@/utils/errors'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResult {
  user: Omit<User, 'passwordHash'>
  tokens: AuthTokens
}

export class AuthService {
  async register(data: {
    email: string
    name: string
    password: string
  }): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(data.email)
    if (existing) {
      throw new ConflictError('An account with this email already exists')
    }

    const { valid, reason } = passwordService.validate(data.password)
    if (!valid) throw new ValidationError(reason!)

    const passwordHash = await passwordService.hash(data.password)
    const user = await userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
    })

    const tokens = await this.issueTokens(user)
    return { user: this.sanitize(user), tokens }
  }

  async login(data: { email: string; password: string; userAgent?: string; ip?: string }): Promise<AuthResult> {
    const user = await userRepository.findByEmail(data.email)
    if (!user || !user.passwordHash) {
      throw new AuthenticationError('Invalid email or password')
    }
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated')
    }

    const valid = await passwordService.compare(data.password, user.passwordHash)
    if (!valid) throw new AuthenticationError('Invalid email or password')

    await userRepository.touch(user.id)
    const tokens = await this.issueTokens(user, data.userAgent, data.ip)
    return { user: this.sanitize(user), tokens }
  }

  async loginWithGoogle(data: {
    idToken?: string
    code?: string
    redirectUri?: string
    userAgent?: string
    ip?: string
  }): Promise<AuthResult> {
    let googleUser: GoogleUserInfo

    if (data.idToken) {
      googleUser = await googleOAuthService.verifyIdToken(data.idToken)
    } else if (data.code && data.redirectUri) {
      googleUser = await googleOAuthService.exchangeCode(data.code, data.redirectUri)
    } else {
      throw new ValidationError('Either idToken or code+redirectUri is required')
    }

    // Find or create user
    let user = await userRepository.findByEmail(googleUser.email)

    if (user) {
      // Link OAuth account if not already linked
      const existing = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider: 'google',
            providerUserId: googleUser.googleId,
          },
        },
      })
      if (!existing) {
        await prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerUserId: googleUser.googleId,
          },
        })
      }
      if (!user.isActive) throw new AuthenticationError('Account is deactivated')
      await userRepository.touch(user.id)
    } else {
      // Create new user
      user = await userRepository.create({
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.avatar,
        emailVerified: googleUser.emailVerified,
      } as any)

      await prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'google',
          providerUserId: googleUser.googleId,
        },
      })
    }

    const tokens = await this.issueTokens(user, data.userAgent, data.ip)
    return { user: this.sanitize(user), tokens }
  }

  async refresh(refreshToken: string, userAgent?: string, ip?: string): Promise<AuthTokens> {
    const payload = jwtService.verifyRefreshToken(refreshToken)
    const tokenHash = jwtService.hashToken(refreshToken)

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new AuthenticationError('Refresh token is invalid or expired')
    }
    if (!stored.user.isActive) {
      throw new AuthenticationError('Account is deactivated')
    }

    // Rotate: revoke old, issue new
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    })

    const tokens = await this.issueTokens(stored.user, userAgent, ip)
    return tokens
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = jwtService.hashToken(refreshToken)
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    })
  }

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    })
  }

  async getProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await userRepository.findById(userId)
    if (!user) throw new NotFoundError('User')
    return this.sanitize(user)
  }

  private async issueTokens(
    user: User,
    userAgent?: string,
    ip?: string,
  ): Promise<AuthTokens> {
    const accessToken = jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    const { token: refreshToken } = jwtService.generateRefreshToken(user.id)
    const tokenHash = jwtService.hashToken(refreshToken)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: jwtService.getRefreshTokenExpiry(),
        userAgent,
        ipAddress: ip,
      },
    })

    // Purge expired tokens for this user (housekeeping)
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    })

    return { accessToken, refreshToken, expiresIn: 900 } // 15 min in seconds
  }

  private sanitize(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _, ...safe } = user
    return safe
  }
}

export const authService = new AuthService()
