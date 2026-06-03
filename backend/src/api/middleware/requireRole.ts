import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@prisma/client'
import { AuthenticationError, AuthorizationError } from '@/utils/errors'

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError())
    }

    const userLevel = ROLE_HIERARCHY[req.user.role as UserRole] ?? 0
    const minRequired = Math.min(...roles.map((r) => ROLE_HIERARCHY[r]))

    if (userLevel < minRequired) {
      return next(new AuthorizationError())
    }

    next()
  }
}

export const requireAdmin = requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN)
