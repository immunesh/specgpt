'use client'
import { RouteGuard } from '@/components/shared/RouteGuard'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
      </div>
    </RouteGuard>
  )
}
