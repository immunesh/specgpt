'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Trash2, Search, MoreVertical, FileText } from 'lucide-react'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AxiosError } from 'axios'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { adminApi } from '@/lib/api/admin'
import { Document } from '@/types'

const statusBadge: Record<string, BadgeProps['variant']> = {
  READY:      'success',
  PROCESSING: 'info',
  PENDING:    'secondary',
  FAILED:     'destructive',
}

const STATUS_COLOR: Record<string, string> = {
  READY:      '#10B981',
  PROCESSING: '#00AEEF',
  PENDING:    'rgba(255,255,255,0.35)',
  FAILED:     '#F87171',
}

function formatBytes(bytes: number): string {
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.035, type: 'spring', stiffness: 280, damping: 22 },
  }),
}

export function DocumentTable() {
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-documents', search],
    queryFn: async () => {
      const res = await adminApi.listDocuments({ limit: 50, search: search || undefined })
      return res.data.data ?? []
    },
    staleTime: 15_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteDocument(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-documents'] }); toast.success('Document deleted') },
    onError: (e: AxiosError<{ error?: string }>) => toast.error(e?.response?.data?.error ?? 'Delete failed'),
  })

  const reprocessMutation = useMutation({
    mutationFn: (id: string) => adminApi.reprocessDocument(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-documents'] }); toast.success('Reprocessing queued') },
    onError: (e: AxiosError<{ error?: string }>) => toast.error(e?.response?.data?.error ?? 'Reprocess failed'),
  })

  const documents: Document[] = data ?? []

  return (
    <div className="space-y-4">
      {/* ─── Toolbar ─── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          />
          <input
            placeholder="Search documents…"
            className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all placeholder:text-white/20"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.85)',
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span
          className="text-xs px-3 py-1.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {documents.length} documents
        </span>
      </div>

      {/* ─── Table ─── */}
      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : documents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl"
          style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)' }}
          >
            <FileText className="h-8 w-8" style={{ color: 'rgba(236,72,153,0.5)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/50">No documents uploaded yet</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Upload a 5G spec PDF above to get started
            </p>
          </div>
        </motion.div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                {['Document', 'Spec', 'Release', 'Status', 'Chunks', 'Size', 'Uploaded', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {documents.map((doc, i) => (
                  <motion.tr
                    key={doc.id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: 12 }}
                    className="group transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)' }}
                        >
                          <FileText className="h-3.5 w-3.5" style={{ color: '#EC4899' }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white/80 leading-tight truncate max-w-[180px]">{doc.name}</p>
                          <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{doc.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {doc.specNumber ? (
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-lg"
                          style={{
                            background: 'rgba(0,174,239,0.1)',
                            border: '1px solid rgba(0,174,239,0.2)',
                            color: '#5BB8D4',
                          }}
                        >
                          {doc.specNumber}
                        </span>
                      ) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {doc.release ? doc.release.replace('REL_', 'Rel-') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: STATUS_COLOR[doc.status] ?? 'rgba(255,255,255,0.2)',
                            boxShadow: doc.status === 'PROCESSING' ? `0 0 6px ${STATUS_COLOR[doc.status]}` : 'none',
                          }}
                        />
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: STATUS_COLOR[doc.status] ?? 'rgba(255,255,255,0.35)' }}
                        >
                          {doc.status}
                        </span>
                        {doc.status === 'PROCESSING' && (
                          <LoadingSpinner size="sm" className="h-3 w-3 ml-0.5" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {doc.chunkCount ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {formatBytes(doc.fileSize)}
                    </td>
                    <td className="px-4 py-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-white/50" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => reprocessMutation.mutate(doc.id)}>
                            <RefreshCw className="h-3.5 w-3.5" />Reprocess
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => { if (confirm(`Delete "${doc.name}"?`)) deleteMutation.mutate(doc.id) }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
