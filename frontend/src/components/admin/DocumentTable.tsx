'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { RefreshCw, Trash2, Search, MoreVertical, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  READY: 'success',
  PROCESSING: 'info',
  PENDING: 'secondary',
  FAILED: 'destructive',
}

function formatBytes(bytes: number): string {
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search documents…" className="pl-8 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <p className="text-sm text-muted-foreground">{documents.length} documents</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Document', 'Spec', 'Release', 'Status', 'Chunks', 'Size', 'Uploaded', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium text-xs leading-tight truncate max-w-[200px]">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{doc.fileName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {doc.specNumber ? (
                      <Badge variant="info" className="text-[10px] font-mono">{doc.specNumber}</Badge>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {doc.release ? doc.release.replace('REL_', 'Rel-') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={statusBadge[doc.status] ?? 'secondary'} className="text-[10px]">
                        {doc.status}
                      </Badge>
                      {doc.status === 'PROCESSING' && <LoadingSpinner size="sm" className="h-3 w-3" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                    {doc.chunkCount ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatBytes(doc.fileSize)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
