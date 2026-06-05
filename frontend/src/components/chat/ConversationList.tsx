'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { Pin, Archive, Trash2, Download, MoreVertical, MessageSquare, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChatStore } from '@/store/chatStore'
import { useConversations } from '@/hooks/useConversations'
import { cn } from '@/lib/utils/cn'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Conversation } from '@/types'

interface Props {
  showSearch?: boolean
}

export function ConversationList({ showSearch = true }: Props) {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const { conversations } = useChatStore()
  const { isLoading, deleteConversation, pinConversation, archiveConversation, exportConversation } = useConversations()

  const filtered = conversations.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()),
  )

  const pinned = filtered.filter((c) => c.isPinned)
  const recent = filtered.filter((c) => !c.isPinned)

  if (isLoading && !conversations.length) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>
  }

  return (
    <div className="flex flex-col h-full">
      {showSearch && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3 w-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              placeholder="Search…"
              className="w-full h-8 pl-8 pr-3 rounded-lg text-xs outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.7)',
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <MessageSquare className="h-8 w-8 mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {search ? 'No results' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 px-2">
            {pinned.length > 0 && (
              <>
                <p className="text-[9px] font-semibold uppercase tracking-widest px-2 py-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Pinned
                </p>
                {pinned.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    pathname={pathname}
                    onDelete={deleteConversation}
                    onPin={pinConversation}
                    onArchive={archiveConversation}
                    onExport={exportConversation}
                  />
                ))}
                <div className="h-px my-1.5 mx-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </>
            )}
            {recent.length > 0 && (
              <>
                {pinned.length > 0 && (
                  <p className="text-[9px] font-semibold uppercase tracking-widest px-2 py-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Recent
                  </p>
                )}
                {recent.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    pathname={pathname}
                    onDelete={deleteConversation}
                    onPin={pinConversation}
                    onArchive={archiveConversation}
                    onExport={exportConversation}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function ConversationItem({
  conv, pathname, onDelete, onPin, onArchive, onExport,
}: {
  conv: Conversation
  pathname: string
  onDelete: (id: string) => void
  onPin: (args: { id: string; isPinned: boolean }) => void
  onArchive: (id: string) => void
  onExport: (id: string, title: string) => void
}) {
  const isActive = pathname === `/chat/${conv.id}`

  return (
    <motion.div
      whileHover={{ x: 1 }}
      className={cn('group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all')}
      style={isActive ? {
        background: 'rgba(0,174,239,0.1)',
        border: '1px solid rgba(0,174,239,0.15)',
      } : {
        background: 'transparent',
        border: '1px solid transparent',
      }}
    >
      <Link href={`/chat/${conv.id}`} className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate"
          style={{ color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)' }}
        >
          {conv.title}
        </p>
        <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {format(new Date(conv.updatedAt), 'MMM d')} · {conv._count?.messages ?? 0} msgs
        </p>
      </Link>

      {conv.isPinned && <Pin className="h-2.5 w-2.5 flex-shrink-0" style={{ color: '#00AEEF', opacity: 0.7 }} />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="h-5 w-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 flex-shrink-0 transition-all"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <MoreVertical className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40"
          style={{ background: 'rgba(10,16,35,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <DropdownMenuItem
            onClick={() => onPin({ id: conv.id, isPinned: !conv.isPinned })}
            className="text-white/70 hover:text-white focus:text-white"
          >
            <Pin className="h-3.5 w-3.5" />{conv.isPinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onExport(conv.id, conv.title)}
            className="text-white/70 hover:text-white focus:text-white"
          >
            <Download className="h-3.5 w-3.5" />Export
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onArchive(conv.id)}
            className="text-white/70 hover:text-white focus:text-white"
          >
            <Archive className="h-3.5 w-3.5" />Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.08)' }} />
          <DropdownMenuItem
            className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
            onClick={() => onDelete(conv.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
