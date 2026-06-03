import { User, UserRole } from '@prisma/client'
import { prisma } from '../client'
import { IUserRepository, CreateUserDto, UpdateUserDto } from '@/domain/repositories/IUserRepository'

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  }

  async create(data: CreateUserDto): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        avatar: data.avatar,
        role: data.role ?? UserRole.USER,
      },
    })
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        avatar: data.avatar,
        role: data.role,
        isActive: data.isActive,
        emailVerified: data.emailVerified,
        lastActiveAt: data.lastActiveAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }

  async findMany(params: {
    page: number
    limit: number
    role?: UserRole
    search?: string
  }): Promise<{ users: User[]; total: number }> {
    const { page, limit, role, search } = params
    const skip = (page - 1) * limit

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ])

    return { users, total }
  }

  async countByRole(): Promise<Record<UserRole, number>> {
    const counts = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    })

    const result: Record<UserRole, number> = {
      USER: 0,
      ADMIN: 0,
      SUPER_ADMIN: 0,
    }

    counts.forEach(({ role, _count }) => {
      result[role] = _count.role
    })

    return result
  }

  async touch(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastActiveAt: new Date() },
    })
  }
}
