import { Router } from 'express'
import { authController } from '@/api/controllers/AuthController'
import { authenticate } from '@/api/middleware/authenticate'
import { validate } from '@/api/middleware/validate'
import { authRateLimiter } from '@/api/middleware/rateLimiter'
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  refreshSchema,
  updateProfileSchema,
} from '@/api/validators/authValidators'

const router = Router()

// ── Public routes ─────────────────────────────────────────────────
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register.bind(authController),
)

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController),
)

router.post(
  '/google',
  authRateLimiter,
  validate(googleAuthSchema),
  authController.googleAuth.bind(authController),
)

router.get(
  '/google/url',
  authController.googleAuthUrl.bind(authController),
)

router.post(
  '/refresh',
  validate(refreshSchema, 'body'),
  authController.refresh.bind(authController),
)

// ── Protected routes ──────────────────────────────────────────────
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController),
)

router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll.bind(authController),
)

router.get(
  '/me',
  authenticate,
  authController.me.bind(authController),
)

router.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile.bind(authController),
)

export { router as authRouter }
