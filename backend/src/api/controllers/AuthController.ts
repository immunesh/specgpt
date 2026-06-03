import { Request, Response, NextFunction } from 'express'
import { authService } from '@/domain/services/AuthService'
import { userRepository } from '@/core/container'
import { analyticsRepository } from '@/core/container'
import {
  RegisterInput,
  LoginInput,
  GoogleAuthInput,
  RefreshInput,
  UpdateProfileInput,
} from '@/api/validators/authValidators'
import { config } from '@/config'
import { NotFoundError } from '@/utils/errors'

const REFRESH_COOKIE_NAME = 'refresh_token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/v1/auth',
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as RegisterInput
      const result = await authService.register(body)

      res.cookie(REFRESH_COOKIE_NAME, result.tokens.refreshToken, COOKIE_OPTIONS)

      await analyticsRepository.recordEvent({
        userId: result.user.id,
        eventType: 'user.register',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
      })
    } catch (err) {
      next(err)
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as LoginInput
      const result = await authService.login({
        ...body,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      })

      res.cookie(REFRESH_COOKIE_NAME, result.tokens.refreshToken, COOKIE_OPTIONS)

      await analyticsRepository.recordEvent({
        userId: result.user.id,
        eventType: 'user.login',
        eventData: { method: 'email' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
      })
    } catch (err) {
      next(err)
    }
  }

  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as GoogleAuthInput
      const result = await authService.loginWithGoogle({
        ...body,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      })

      res.cookie(REFRESH_COOKIE_NAME, result.tokens.refreshToken, COOKIE_OPTIONS)

      await analyticsRepository.recordEvent({
        userId: result.user.id,
        eventType: 'user.login',
        eventData: { method: 'google' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
      })
    } catch (err) {
      next(err)
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Accept from cookie (preferred) or body (fallback for mobile)
      const refreshToken =
        req.cookies[REFRESH_COOKIE_NAME] ?? (req.body as RefreshInput).refreshToken

      if (!refreshToken) {
        res.status(401).json({ success: false, error: 'Refresh token missing' })
        return
      }

      const tokens = await authService.refresh(
        refreshToken,
        req.headers['user-agent'],
        req.ip,
      )

      res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, COOKIE_OPTIONS)

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
        },
      })
    } catch (err) {
      next(err)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies[REFRESH_COOKIE_NAME] ?? req.body?.refreshToken

      if (refreshToken) {
        await authService.logout(refreshToken)
      }

      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' })

      res.json({ success: true, message: 'Logged out successfully' })
    } catch (err) {
      next(err)
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logoutAll(req.user!.id)
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' })
      res.json({ success: true, message: 'All sessions terminated' })
    } catch (err) {
      next(err)
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.id)
      res.json({ success: true, data: user })
    } catch (err) {
      next(err)
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as UpdateProfileInput
      const user = await userRepository.update(req.user!.id, body)
      const { passwordHash: _, ...safe } = user
      res.json({ success: true, data: safe })
    } catch (err) {
      next(err)
    }
  }

  async googleAuthUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { googleOAuthService } = await import('@/core/auth/GoogleOAuthService')
      const redirectUri = `${config.frontend.url}/auth/callback/google`
      const url = googleOAuthService.getAuthUrl(redirectUri, req.query.state as string)
      res.json({ success: true, data: { url } })
    } catch (err) {
      next(err)
    }
  }
}

export const authController = new AuthController()
