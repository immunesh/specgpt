import pdfParse from 'pdf-parse'
import { logger } from '@/utils/logger'
import { AppError } from '@/utils/errors'

export interface ExtractedPage {
  pageNumber: number
  text: string
}

export interface ExtractionResult {
  fullText: string
  pages: ExtractedPage[]
  totalPages: number
  metadata: {
    title?: string
    author?: string
    specNumber?: string
    release?: string
  }
}

// 3GPP spec number patterns: TS 38.331, TR 21.916, etc.
const SPEC_NUMBER_RE = /\b(TS|TR)\s+(\d{2,3}\.\d{3})\b/i
const RELEASE_RE = /Release\s+(\d{1,2})\b|Rel[-.]\s*(\d{1,2})\b/i

export class PdfExtractor {
  async extract(buffer: Buffer): Promise<ExtractionResult> {
    try {
      const result = await pdfParse(buffer, {
        // Preserve page breaks as section separators
        pagerender: (pageData: any) => pageData.getTextContent().then((content: any) => {
          return content.items.map((item: any) => item.str).join(' ')
        }),
      })

      const fullText = this.normalizeText(result.text)
      const pages = this.splitIntoPages(result.text, result.numpages)

      const metadata = this.extractMetadata(fullText, result.info)

      logger.debug('PDF extracted', {
        pages: result.numpages,
        chars: fullText.length,
        specNumber: metadata.specNumber,
      })

      return {
        fullText,
        pages,
        totalPages: result.numpages,
        metadata,
      }
    } catch (err: any) {
      logger.error('PDF extraction failed', { error: err.message })
      throw new AppError('Failed to extract text from PDF: ' + err.message, 422, 'PDF_EXTRACTION_ERROR')
    }
  }

  private normalizeText(raw: string): string {
    return raw
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Collapse excessive blank lines
      .replace(/\n{4,}/g, '\n\n\n')
      // Remove null bytes and control chars
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize dashes and quotes
      .replace(/[–—]/g, '-')
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      .trim()
  }

  private splitIntoPages(rawText: string, totalPages: number): ExtractedPage[] {
    // pdf-parse puts form feeds (\f) between pages in some modes
    const pageSplit = rawText.split('\f')

    if (pageSplit.length === totalPages) {
      return pageSplit.map((text, i) => ({
        pageNumber: i + 1,
        text: this.normalizeText(text),
      }))
    }

    // Fallback: treat as single block, approximate page boundaries
    const charsPerPage = Math.ceil(rawText.length / totalPages)
    const pages: ExtractedPage[] = []
    for (let i = 0; i < totalPages; i++) {
      pages.push({
        pageNumber: i + 1,
        text: this.normalizeText(rawText.slice(i * charsPerPage, (i + 1) * charsPerPage)),
      })
    }
    return pages
  }

  private extractMetadata(
    text: string,
    pdfInfo: Record<string, any>,
  ): ExtractionResult['metadata'] {
    const specMatch = SPEC_NUMBER_RE.exec(text)
    const releaseMatch = RELEASE_RE.exec(text)

    return {
      title: pdfInfo?.Title || undefined,
      author: pdfInfo?.Author || undefined,
      specNumber: specMatch ? `${specMatch[1].toUpperCase()} ${specMatch[2]}` : undefined,
      release: releaseMatch
        ? String(releaseMatch[1] || releaseMatch[2])
        : undefined,
    }
  }
}

export const pdfExtractor = new PdfExtractor()
