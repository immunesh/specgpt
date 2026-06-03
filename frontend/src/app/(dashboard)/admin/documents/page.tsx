'use client'
import { DocumentUpload } from '@/components/admin/DocumentUpload'
import { DocumentTable } from '@/components/admin/DocumentTable'

export default function AdminDocumentsPage() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <header className="h-14 border-b border-border px-6 flex items-center flex-shrink-0">
        <h1 className="text-lg font-semibold">Document Management</h1>
      </header>
      <div className="flex-1 p-6 space-y-6">
        <DocumentUpload />
        <DocumentTable />
      </div>
    </div>
  )
}
