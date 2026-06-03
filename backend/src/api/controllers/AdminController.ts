import { Request, Response, NextFunction } from 'express'
import { userRepository, analyticsRepository, documentRepository } from '@/core/container'
import { ListUsersInput, UpdateUserInput } from '@/api/validators/adminValidators'
import { AuthorizationError, NotFoundError } from '@/utils/errors'
import { UserRole } from '@prisma/client'

export class AdminController {
  // ── Users ─────────────────────────────────────────────────────────

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = req.query as unknown as ListUsersInput
      const result = await userRepository.findMany({
        page: Number(q.page) || 1,
        limit: Math.min(Number(q.limit) || 20, 100),
        role: q.role,
        search: q.search,
      })
      res.json({
        success: true,
        data: result.users,
        meta: {
          total: result.total,
          totalPages: Math.ceil(result.total / (Number(q.limit) || 20)),
          page: Number(q.page) || 1,
        },
      })
    } catch (err) { next(err) }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      const body = req.body as UpdateUserInput

      // Super admin protection: only SUPER_ADMIN can promote to SUPER_ADMIN
      if (body.role === UserRole.SUPER_ADMIN && req.user!.role !== UserRole.SUPER_ADMIN) {
        throw new AuthorizationError('Only Super Admins can assign Super Admin role')
      }

      // Cannot demote yourself
      if (id === req.user!.id && body.role && body.role !== req.user!.role) {
        throw new AuthorizationError('Cannot change your own role')
      }

      const target = await userRepository.findById(id)
      if (!target) throw new NotFoundError('User')

      const updated = await userRepository.update(id, {
        role: body.role,
        isActive: body.isActive,
        name: body.name,
      })

      const { passwordHash: _, ...safe } = updated
      res.json({ success: true, data: safe })
    } catch (err) { next(err) }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params
      if (id === req.user!.id) throw new AuthorizationError('Cannot delete your own account')
      const target = await userRepository.findById(id)
      if (!target) throw new NotFoundError('User')
      if (target.role === UserRole.SUPER_ADMIN) throw new AuthorizationError('Cannot delete a Super Admin')
      await userRepository.delete(id)
      res.json({ success: true, message: 'User deleted' })
    } catch (err) { next(err) }
  }

  async countByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const counts = await userRepository.countByRole()
      res.json({ success: true, data: counts })
    } catch (err) { next(err) }
  }

  // ── Analytics ──────────────────────────────────────────────────────

  async getSystemStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await analyticsRepository.getSystemStats()
      res.json({ success: true, data: stats })
    } catch (err) { next(err) }
  }

  async getDailyUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = Math.min(Number(req.query.days) || 30, 90)
      const data = await analyticsRepository.getDailyUsage(days)
      res.json({ success: true, data })
    } catch (err) { next(err) }
  }

  async getTopUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(Number(req.query.limit) || 10, 50)
      const data = await analyticsRepository.getTopUsers(limit)
      res.json({ success: true, data })
    } catch (err) { next(err) }
  }

  // ── Documents ──────────────────────────────────────────────────────

  async listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '20', status, series, release, search } = req.query as Record<string, string>
      const result = await documentRepository.findMany({
        page: Number(page),
        limit: Math.min(Number(limit), 100),
        status: status as any,
        series: series as any,
        release: release as any,
        search,
      })
      res.json({
        success: true,
        data: result.documents,
        meta: {
          total: result.total,
          totalPages: Math.ceil(result.total / Number(limit)),
        },
      })
    } catch (err) { next(err) }
  }
}

export const adminController = new AdminController()
