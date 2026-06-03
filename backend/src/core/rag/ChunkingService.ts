import crypto from 'crypto'

export interface TextChunk {
  index: number
  content: string
  contentHash: string
  pageStart?: number
  pageEnd?: number
  section?: string
  tokenCount: number
}

export interface ChunkingOptions {
  maxChunkTokens: number   // target max tokens per chunk
  overlapTokens: number    // overlap between adjacent chunks
  minChunkTokens: number   // discard chunks smaller than this
}

// 3GPP section header patterns:
// "5.1 System Overview", "5.1.2.3 Handover", "Annex A", "6.2.1.1"
const SECTION_HEADER_RE = /^(?:\d+(?:\.\d+){0,4}|Annex\s+[A-Z](?:\.\d+)*)\s+.{5,}/m
const SUBSECTION_RE = /^\d+(?:\.\d+){1,4}\s+\S/

const CHARS_PER_TOKEN = 4 // ~4 chars per token for technical English

export class ChunkingService {
  private readonly opts: ChunkingOptions

  constructor(opts: Partial<ChunkingOptions> = {}) {
    this.opts = {
      maxChunkTokens: opts.maxChunkTokens ?? 400,
      overlapTokens: opts.overlapTokens ?? 60,
      minChunkTokens: opts.minChunkTokens ?? 30,
    }
  }

  chunkDocument(
    fullText: string,
    pageMap?: Map<number, number>,  // charOffset → pageNumber
  ): TextChunk[] {
    // 1. Split on section boundaries first (preserves spec structure)
    const sections = this.splitIntoSections(fullText)

    const allChunks: TextChunk[] = []
    let globalIndex = 0

    for (const section of sections) {
      const sectionChunks = this.chunkSection(section.text, section.header)

      for (const chunk of sectionChunks) {
        const tokenCount = this.estimateTokens(chunk.content)
        if (tokenCount < this.opts.minChunkTokens) continue

        allChunks.push({
          index: globalIndex++,
          content: chunk.content.trim(),
          contentHash: this.hash(chunk.content),
          section: section.header,
          tokenCount,
        })
      }
    }

    return allChunks
  }

  chunkDocumentWithPages(
    text: string,
    pageTexts: { pageNumber: number; text: string }[],
  ): TextChunk[] {
    const chunks: TextChunk[] = []
    let globalIndex = 0

    for (const page of pageTexts) {
      if (!page.text.trim()) continue

      const sections = this.splitIntoSections(page.text)

      for (const section of sections) {
        const sectionChunks = this.chunkSection(section.text, section.header)

        for (const chunk of sectionChunks) {
          const tokenCount = this.estimateTokens(chunk.content)
          if (tokenCount < this.opts.minChunkTokens) continue

          chunks.push({
            index: globalIndex++,
            content: chunk.content.trim(),
            contentHash: this.hash(chunk.content),
            section: section.header,
            pageStart: page.pageNumber,
            pageEnd: page.pageNumber,
            tokenCount,
          })
        }
      }
    }

    return chunks
  }

  private splitIntoSections(
    text: string,
  ): Array<{ header: string; text: string }> {
    const lines = text.split('\n')
    const sections: Array<{ header: string; text: string }> = []
    let currentHeader = ''
    let currentLines: string[] = []

    for (const line of lines) {
      if (SECTION_HEADER_RE.test(line.trim())) {
        if (currentLines.length > 0) {
          sections.push({ header: currentHeader, text: currentLines.join('\n') })
        }
        currentHeader = line.trim()
        currentLines = [line]
      } else {
        currentLines.push(line)
      }
    }

    if (currentLines.length > 0) {
      sections.push({ header: currentHeader, text: currentLines.join('\n') })
    }

    // If no section structure found, treat whole text as one section
    if (sections.length === 0) {
      sections.push({ header: '', text })
    }

    return sections
  }

  private chunkSection(
    text: string,
    sectionHeader: string,
  ): Array<{ content: string }> {
    const maxChars = this.opts.maxChunkTokens * CHARS_PER_TOKEN
    const overlapChars = this.opts.overlapTokens * CHARS_PER_TOKEN

    if (text.length <= maxChars) {
      return [{ content: sectionHeader ? `${sectionHeader}\n\n${text}` : text }]
    }

    // Split on paragraph boundaries
    const paragraphs = text.split(/\n\n+/)
    const chunks: Array<{ content: string }> = []
    let current = sectionHeader ? `${sectionHeader}\n\n` : ''

    for (const para of paragraphs) {
      const candidate = current + para + '\n\n'

      if (candidate.length > maxChars && current.length > 0) {
        chunks.push({ content: current.trim() })
        // Overlap: carry last `overlapChars` of previous chunk into next
        const overlap = current.slice(-overlapChars)
        current = overlap + para + '\n\n'
      } else {
        current = candidate
      }
    }

    if (current.trim()) {
      chunks.push({ content: current.trim() })
    }

    return chunks
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / CHARS_PER_TOKEN)
  }

  private hash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex')
  }
}

export const chunkingService = new ChunkingService()
