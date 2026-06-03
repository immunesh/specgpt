import Anthropic from '@anthropic-ai/sdk'
import { config } from '@/config'
import { logger } from '@/utils/logger'

export type GuardResult =
  | { allowed: true }
  | { allowed: false; reason: string }

// Definitive 5G/telecom keyword set — if any match → allow immediately
const ALLOW_KEYWORDS = new Set([
  '5g', 'nr', 'lte', '4g', 'ran', 'gNB', 'gnb', 'enb', 'amf', 'smf', 'upf',
  'nrf', 'ausf', 'udm', 'udr', 'pcf', 'nssf', 'sepp', 'scp', '5gc', 'epc',
  '3gpp', '3GPP', 'ts 38', 'ts 23', 'ts 24', 'ts 29', 'ts 33', 'ts 37',
  'release 15', 'release 16', 'release 17', 'release 18', 'rel-15', 'rel-16',
  'rel-17', 'rel-18', 'o-ran', 'oran', 'etsi', 'ng-ran', 'ngran',
  'pdcch', 'pdsch', 'pucch', 'pusch', 'prach', 'ssb', 'pss', 'sss', 'pbch',
  'coreset', 'dmrs', 'csi-rs', 'srs', 'harq', 'rlc', 'mac', 'pdcp', 'sdap',
  'rrc', 'nas', 'ngap', 'xnap', 'f1ap', 'e1ap', 'n1', 'n2', 'n3', 'n4',
  'beamforming', 'massive mimo', 'mmwave', 'mm-wave', 'fr1', 'fr2',
  'sub-6ghz', 'sub-6', 'millimeter', 'bandwidth', 'spectrum', 'carrier aggregation',
  'network slicing', 'nssai', 's-nssai', 'urllc', 'embb', 'mmtc',
  'registration', 'handover', 'handoff', 'pdu session', 'qos', 'qfi',
  'authentication', '5g-aka', 'eas', 'eap', 'supi', 'suci', 'guti',
  'cell id', 'pci', 'earfcn', 'nrarfcn', 'arfcn', 'mcc', 'mnc', 'plmn',
  'ue', 'user equipment', 'base station', 'cell', 'sector',
  'cqm', 'cqi', 'ri', 'pmi', 'sinr', 'rsrp', 'rsrq', 'snr',
  'du', 'cu', 'ru', 'ric', 'e2', 'a1', 'o1', 'o2',
  'standalone', 'non-standalone', 'nsa', 'sa mode',
  'slice', 'nfv', 'sdn', 'mec', 'edge computing',
  'iab', 'sidelink', 'v2x', 'nr-v2x', 'prose',
  'positioning', 'location', 'nr positioning',
])

// Hard-reject keywords — clearly off-topic (fast reject)
const REJECT_KEYWORDS = new Set([
  'recipe', 'cooking', 'movie', 'film', 'sports', 'weather', 'joke',
  'poem', 'story', 'game', 'travel', 'fashion', 'relationship', 'dating',
  'political', 'philosophy', 'religion', 'astrology', 'horoscope',
])

export class FiveGGuard {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({ apiKey: config.anthropic.apiKey })
  }

  async check(query: string): Promise<GuardResult> {
    const lower = query.toLowerCase()
    const words = lower.split(/\s+/)

    // Fast-allow: contains a definitive 5G keyword
    if (words.some((w) => ALLOW_KEYWORDS.has(w)) ||
        Array.from(ALLOW_KEYWORDS).some((kw) => kw.includes(' ') && lower.includes(kw))) {
      return { allowed: true }
    }

    // Fast-reject: contains a clear off-topic keyword
    if (words.some((w) => REJECT_KEYWORDS.has(w))) {
      return {
        allowed: false,
        reason: 'I can only answer questions related to 5G telecommunications specifications and standards. Your question appears to be outside this domain.',
      }
    }

    // Ambiguous — use Claude Haiku for a fast, cheap classification
    return this.classifyWithAI(query)
  }

  private async classifyWithAI(query: string): Promise<GuardResult> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001', // Fast + cheap for classification
        max_tokens: 10,
        system: 'You are a classifier. Reply only "YES" if the question is about 5G telecommunications, wireless networks, 3GPP standards, O-RAN, or related telecom technology. Reply only "NO" otherwise.',
        messages: [{ role: 'user', content: query }],
      })

      const text = response.content[0].type === 'text'
        ? response.content[0].text.trim().toUpperCase()
        : 'NO'

      if (text.startsWith('YES')) {
        return { allowed: true }
      }

      logger.debug('5G guard rejected query via AI', { query: query.slice(0, 80) })
      return {
        allowed: false,
        reason: 'I am specialized exclusively in 5G telecommunications specifications (3GPP, O-RAN, ETSI standards). Please ask a question related to 5G technology, network architecture, protocols, or specifications.',
      }
    } catch (err) {
      // On guard failure, allow through — better to answer than block
      logger.warn('5G guard AI check failed, allowing query', { error: (err as Error).message })
      return { allowed: true }
    }
  }
}

export const fiveGGuard = new FiveGGuard()
