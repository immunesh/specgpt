import { describe, it, expect } from 'vitest'
import { ChunkingService } from '../ChunkingService'

const svc = new ChunkingService({ maxChunkTokens: 100, overlapTokens: 20, minChunkTokens: 10 })

const SAMPLE_3GPP_TEXT = `5.1 System Overview

The 5G System (5GS) is defined in 3GPP TS 23.501. It consists of the 5G Core Network (5GC)
and the Next Generation Radio Access Network (NG-RAN).

5.1.1 Network Functions

The 5GC includes the following key network functions:
- AMF: Access and Mobility Management Function
- SMF: Session Management Function
- UPF: User Plane Function
- NRF: Network Repository Function
- AUSF: Authentication Server Function
- UDM: Unified Data Management

5.1.2 Interface Overview

The N1 interface connects the UE to the AMF.
The N2 interface connects the NG-RAN to the AMF.
The N3 interface connects the NG-RAN to the UPF.
The N4 interface connects the SMF to the UPF.
`

describe('ChunkingService', () => {
  it('produces chunks from structured 3GPP text', () => {
    const chunks = svc.chunkDocument(SAMPLE_3GPP_TEXT)
    expect(chunks.length).toBeGreaterThan(0)
    chunks.forEach((c) => {
      expect(c.content.length).toBeGreaterThan(0)
      expect(c.contentHash).toHaveLength(64)
      expect(c.tokenCount).toBeGreaterThan(0)
    })
  })

  it('each chunk stays within max token limit', () => {
    const chunks = svc.chunkDocument(SAMPLE_3GPP_TEXT)
    // Allow 20% headroom for overlap
    const hardMax = 100 * 4 * 1.2
    chunks.forEach((c) => {
      expect(c.content.length).toBeLessThanOrEqual(hardMax)
    })
  })

  it('assigns unique content hashes', () => {
    const chunks = svc.chunkDocument(SAMPLE_3GPP_TEXT)
    const hashes = chunks.map((c) => c.contentHash)
    const unique = new Set(hashes)
    expect(unique.size).toBe(hashes.length)
  })

  it('handles empty input gracefully', () => {
    const chunks = svc.chunkDocument('   ')
    expect(chunks).toHaveLength(0)
  })

  it('detects section headers', () => {
    const chunks = svc.chunkDocument(SAMPLE_3GPP_TEXT)
    const withSections = chunks.filter((c) => c.section && c.section.length > 0)
    expect(withSections.length).toBeGreaterThan(0)
  })
})
