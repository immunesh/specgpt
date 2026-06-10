'use client'
import { motion } from 'framer-motion'
import { FileText, CloudUpload } from 'lucide-react'
import { DocumentUpload } from '@/components/admin/DocumentUpload'
import { DocumentTable } from '@/components/admin/DocumentTable'

export default function AdminDocumentsPage() {
  return (
    <div className="flex flex-col h-full overflow-auto" style={{ background: 'linear-gradient(180deg, #070D1C 0%, #080F1E 100%)' }}>
      {/* ─── Header ─── */}
      <header
        className="h-16 px-6 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)' }}
          >
            <FileText className="h-4.5 w-4.5" style={{ color: '#EC4899' }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-sm font-semibold text-white/90">Document Management</h1>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Upload and manage 5G specification PDFs</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(236,72,153,0.08)',
            border: '1px solid rgba(236,72,153,0.2)',
            color: '#EC4899',
          }}
        >
          <CloudUpload className="h-3.5 w-3.5" />
          RAG Knowledge Base
        </motion.div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DocumentUpload />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DocumentTable />
        </motion.div>
      </div>
    </div>
  )
}
