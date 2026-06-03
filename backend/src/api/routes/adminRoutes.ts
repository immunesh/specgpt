import { Router } from 'express'
import { adminController } from '@/api/controllers/AdminController'
import { authenticate } from '@/api/middleware/authenticate'
import { requireAdmin } from '@/api/middleware/requireRole'
import { validate } from '@/api/middleware/validate'
import {
  listUsersSchema,
  updateUserSchema,
  dailyAnalyticsSchema,
  topUsersSchema,
} from '@/api/validators/adminValidators'

const router = Router()

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin)

// ── Users ──────────────────────────────────────────────────────────
router.get('/users', validate(listUsersSchema, 'query'), adminController.listUsers.bind(adminController))
router.get('/users/role-counts', adminController.countByRole.bind(adminController))
router.patch('/users/:id', validate(updateUserSchema), adminController.updateUser.bind(adminController))
router.delete('/users/:id', adminController.deleteUser.bind(adminController))

// ── Analytics ──────────────────────────────────────────────────────
router.get('/stats', adminController.getSystemStats.bind(adminController))
router.get('/analytics/daily', validate(dailyAnalyticsSchema, 'query'), adminController.getDailyUsage.bind(adminController))
router.get('/analytics/top-users', validate(topUsersSchema, 'query'), adminController.getTopUsers.bind(adminController))

// ── Documents ──────────────────────────────────────────────────────
router.get('/documents', adminController.listDocuments.bind(adminController))

export { router as adminRouter }
