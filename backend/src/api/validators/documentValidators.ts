import { z } from 'zod'
import { SpecSeries, Release, DocumentStatus } from '@prisma/client'

export const uploadDocumentSchema = z.object({
  specNumber: z.string().max(50).trim().optional(),
  specTitle: z.string().max(500).trim().optional(),
  series: z.nativeEnum(SpecSeries).optional(),
  release: z.nativeEnum(Release).optional(),
})

export const listDocumentsSchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('20').transform(Number),
  status: z.nativeEnum(DocumentStatus).optional(),
  series: z.nativeEnum(SpecSeries).optional(),
  release: z.nativeEnum(Release).optional(),
  search: z.string().max(200).optional(),
})

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>
export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>
