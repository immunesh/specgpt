import { describe, it, expect, vi, beforeAll } from 'vitest'

// Stub env before imports
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.JWT_SECRET = 'test_jwt_secret_that_is_at_least_32_characters_long'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_at_least_32_chars'
process.env.ANTHROPIC_API_KEY = 'test-key'

// Mock Anthropic SDK so tests don't make real API calls
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'YES' }],
      }),
    }
  },
}))

import { FiveGGuard } from '../FiveGGuard'

const guard = new FiveGGuard()

describe('FiveGGuard', () => {
  describe('fast-allow keywords', () => {
    const allowed = [
      'What is the 5G NR physical layer architecture?',
      'How does gNB handle handover in TS 38.300?',
      'Explain AMF selection in 5GC',
      'What is PDCCH in NR?',
      'How does beamforming work in massive MIMO?',
      'What are the N2 interface procedures?',
      'Explain HARQ retransmissions in NR MAC',
    ]

    allowed.forEach((q) => {
      it(`allows: "${q.slice(0, 50)}"`, async () => {
        const result = await guard.check(q)
        expect(result.allowed).toBe(true)
      })
    })
  })

  describe('fast-reject keywords', () => {
    const rejected = [
      'Give me a pasta recipe',
      'What is the weather today?',
      'Tell me a joke',
    ]

    rejected.forEach((q) => {
      it(`rejects: "${q}"`, async () => {
        const result = await guard.check(q)
        expect(result.allowed).toBe(false)
        if (!result.allowed) {
          expect(result.reason).toBeTruthy()
        }
      })
    })
  })

  describe('prompt builder rejection message', () => {
    it('generates a helpful rejection with 5G topic suggestions', async () => {
      const { promptBuilder } = await import('../PromptBuilder')
      const msg = promptBuilder.buildRejectionMessage('Your question is not about 5G.')
      expect(msg).toContain('5G')
      expect(msg).toContain('TS 38')
      expect(msg).toContain('3GPP')
    })
  })
})
