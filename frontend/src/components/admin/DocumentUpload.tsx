'use client'
import { useRef, useState, DragEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminApi } from '@/lib/api/admin'
import { cn } from '@/lib/utils/cn'

export function DocumentUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [specNumber, setSpecNumber] = useState('')
  const [specTitle, setSpecTitle] = useState('')
  const qc = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected')
      const fd = new FormData()
      fd.append('file', file)
      if (specNumber.trim()) fd.append('specNumber', specNumber.trim())
      if (specTitle.trim()) fd.append('specTitle', specTitle.trim())
      return adminApi.uploadDocument(fd)
    },
    onSuccess: (res) => {
      toast.success(`"${res.data.data?.name}" queued for processing`)
      setFile(null)
      setSpecNumber('')
      setSpecTitle('')
      qc.invalidateQueries({ queryKey: ['admin-documents'] })
    },
    onError: (e: AxiosError<{ error?: string }>) => toast.error(e?.response?.data?.error ?? 'Upload failed'),
  })

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
    } else {
      toast.error('Only PDF files are accepted')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4 p-4 border border-border rounded-xl bg-card">
      <h3 className="font-semibold text-sm">Upload 5G Specification PDF</h3>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
          file && 'cursor-default',
        )}
      >
        {file ? (
          <div className="flex items-center gap-3 justify-center">
            <FileText className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-2"
              onClick={(e) => { e.stopPropagation(); setFile(null) }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">Drop PDF here or click to browse</p>
            <p className="text-xs text-muted-foreground">Max 50 MB · PDF only</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
      </div>

      {/* Metadata */}
      {file && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Spec Number <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              placeholder="e.g. TS 38.331"
              className="h-8 text-sm font-mono"
              value={specNumber}
              onChange={(e) => setSpecNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Spec Title <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              placeholder="e.g. NR Radio Resource Control"
              className="h-8 text-sm"
              value={specTitle}
              onChange={(e) => setSpecTitle(e.target.value)}
            />
          </div>
        </div>
      )}

      {file && (
        <Button
          className="w-full"
          onClick={() => uploadMutation.mutate()}
          loading={uploadMutation.isPending}
          disabled={uploadMutation.isPending}
        >
          <Upload className="h-4 w-4" />
          Upload & Process
        </Button>
      )}
    </div>
  )
}
