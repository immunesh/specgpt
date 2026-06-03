import { describe, it, expect } from 'vitest'
import { PasswordService } from '../PasswordService'

const svc = new PasswordService()

describe('PasswordService', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await svc.hash('MyPassword1')
    expect(await svc.compare('MyPassword1', hash)).toBe(true)
    expect(await svc.compare('WrongPassword1', hash)).toBe(false)
  })

  it('validates password requirements', () => {
    expect(svc.validate('short')).toMatchObject({ valid: false })
    expect(svc.validate('alllowercase1')).toMatchObject({ valid: false })
    expect(svc.validate('ALLUPPERCASE1')).toMatchObject({ valid: false })
    expect(svc.validate('NoNumbers!')).toMatchObject({ valid: false })
    expect(svc.validate('Valid1Password')).toMatchObject({ valid: true })
  })
})
