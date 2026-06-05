'use client'
import { DocumentUpload } from '@/components/admin/DocumentUpload'
import { DocumentTable } from '@/components/admin/DocumentTable'

export default function AdminDocumentsPage() {
  return (
    <div className="flex flex-col h-full overflow-auto" style={{ background: 'linear-gradient(180deg, #070D1C 0%, #080F1E 100%)' }}>
      <header
        className="h-14 px-6 flex items-center flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h1 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>Document Management</h1>
      </header>
      <div className="flex-1 p-6 space-y-6">
        <DocumentUpload />
        <DocumentTable />
      </div>
    </div>
  )
}
