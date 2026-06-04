import { User, UserRole } from '@prisma/client'

export interface CreateUserDto {
  email: string
  name: string
  passwordHash?: string
  avatar?: string
  role?: UserRole
}

export interface UpdateUserDto {
  name?: string
  avatar?: string | null
  role?: UserRole
  isActive?: boolean
  emailVerified?: boolean
  lastActiveAt?: Date
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserDto): Promise<User>
  update(id: string, data: UpdateUserDto): Promise<User>
  delete(id: string): Promise<void>
  findMany(params: {
    page: number
    limit: number
    role?: UserRole
    search?: string
  }): Promise<{ users: User[]; total: number }>
  countByRole(): Promise<Record<UserRole, number>>
  touch(id: string): Promise<void>
}
