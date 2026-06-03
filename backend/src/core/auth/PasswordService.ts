import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }

  validate(password: string): { valid: boolean; reason?: string } {
    if (password.length < 8) {
      return { valid: false, reason: 'Password must be at least 8 characters' }
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, reason: 'Password must contain an uppercase letter' }
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, reason: 'Password must contain a lowercase letter' }
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, reason: 'Password must contain a number' }
    }
    return { valid: true }
  }
}

export const passwordService = new PasswordService()
