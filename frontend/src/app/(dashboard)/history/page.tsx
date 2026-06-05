import type { Metadata } from 'next'
import { ConversationList } from '@/components/chat/ConversationList'

export const metadata: Metadata = { title: 'History' }

export default function HistoryPage() {
  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #070D1C 0%, #080F1E 100%)' }}>
      <header
        className="h-14 px-6 flex items-center flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h1 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Conversation History
        </h1>
      </header>
      <div className="flex-1 overflow-hidden pt-4 text-white/70">
        <ConversationList showSearch />
      </div>
    </div>
  )
}
