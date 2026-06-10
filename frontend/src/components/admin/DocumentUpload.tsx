'use client'
import { useRef, useState, DragEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CloudUpload, CheckCircle2 } from 'lucide-react'
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

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.85)',
    borderRadius: '0.75rem',
  }

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)' }}
        >
          <CloudUpload className="h-4 w-4" style={{ color: '#EC4899' }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/85">Upload 5G Specification PDF</h3>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Max 50 MB · PDF only</p>
        </div>
      </div>

      {/* ─── Drop Zone ─── */}
      <motion.div
        animate={isDragging ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className="relative rounded-xl transition-all cursor-pointer overflow-hidden"
        style={{
          border: isDragging
            ? '2px dashed rgba(236,72,153,0.6)'
            : file
              ? '2px solid rgba(16,185,129,0.4)'
              : '2px dashed rgba(255,255,255,0.1)',
          background: isDragging
            ? 'rgba(236,72,153,0.05)'
            : file
              ? 'rgba(16,185,129,0.04)'
              : 'rgba(255,255,255,0.02)',
          cursor: file ? 'default' : 'pointer',
        }}
      >
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-4 p-5"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <FileText className="h-6 w-6" style={{ color: '#10B981' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/85 truncate">{file.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatSize(file.size)}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <CheckCircle2 className="h-3 w-3" style={{ color: '#10B981' }} />
                  <span className="text-[11px]" style={{ color: '#10B981' }}>Ready to upload</span>
                </div>
              </div>
              <button
                className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
              >
                <X className="h-4 w-4 text-white/50" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 gap-3"
            >
              <motion.div
                animate={isDragging ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: isDragging ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isDragging ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <Upload className="h-6 w-6" style={{ color: isDragging ? '#EC4899' : 'rgba(255,255,255,0.3)' }} />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium text-white/60">
                  {isDragging ? 'Drop it here' : 'Drop PDF here or click to browse'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  3GPP, O-RAN, ETSI specifications
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }}
        />
      </motion.div>

      {/* ─── Metadata fields (animated reveal) ─── */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">
                  Spec Number <span style={{ color: 'rgba(255,255,255,0.25)' }}>(optional)</span>
                </Label>
                <input
                  placeholder="e.g. TS 38.331"
                  className="w-full h-9 px-3 rounded-xl text-sm font-mono outline-none transition-all placeholder:text-white/20 focus:ring-1"
                  style={{ ...inputStyle, '--tw-ring-color': 'rgba(0,174,239,0.4)' } as React.CSSProperties}
                  value={specNumber}
                  onChange={(e) => setSpecNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">
                  Spec Title <span style={{ color: 'rgba(255,255,255,0.25)' }}>(optional)</span>
                </Label>
                <input
                  placeholder="e.g. NR Radio Resource Control"
                  className="w-full h-9 px-3 rounded-xl text-sm outline-none transition-all placeholder:text-white/20 focus:ring-1"
                  style={{ ...inputStyle, '--tw-ring-color': 'rgba(0,174,239,0.4)' } as React.CSSProperties}
                  value={specTitle}
                  onChange={(e) => setSpecTitle(e.target.value)}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={uploadMutation.isPending}
              onClick={() => uploadMutation.mutate()}
              className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{
                background: uploadMutation.isPending
                  ? 'rgba(236,72,153,0.15)'
                  : 'linear-gradient(135deg, #EC4899, #BE185D)',
                border: '1px solid rgba(236,72,153,0.3)',
                color: 'white',
                boxShadow: uploadMutation.isPending ? 'none' : '0 4px 20px rgba(236,72,153,0.3)',
              }}
            >
              {uploadMutation.isPending ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload & Process
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
