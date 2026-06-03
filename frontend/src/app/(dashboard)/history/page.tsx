import type { Metadata } from 'next'
import { ConversationList } from '@/components/chat/ConversationList'

export const metadata: Metadata = { title: 'History' }

export default function HistoryPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border px-6 flex items-center flex-shrink-0">
        <h1 className="text-lg font-semibold">Conversation History</h1>
      </header>
      <div className="flex-1 overflow-hidden pt-4">
        <ConversationList showSearch />
      </div>
    </div>
  )
}
