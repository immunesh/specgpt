import type { Metadata } from 'next'
import { HistoryPageClient } from '@/components/chat/HistoryPageClient'

export const metadata: Metadata = { title: 'History' }

export default function HistoryPage() {
  return <HistoryPageClient />
}
