'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { Pin, Archive, Trash2, Download, MoreVertical, MessageSquare, Search } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { useConversations } from '@/hooks/useConversations'
import { cn } from '@/lib/utils/cn'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Conversation } from '@/types'

interface Props {
  showSearch?: boolean
}

export function ConversationList({ showSearch = true }: Props) {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const { conversations, isLoading: storeLoading } = useChatStore()
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
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search conversations…"
              className="pl-8 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? 'No conversations match your search' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 px-2">
            {pinned.length > 0 && (
              <>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5">Pinned</p>
                {pinned.map((conv) => <ConversationItem key={conv.id} conv={conv} pathname={pathname} onDelete={deleteConversation} onPin={pinConversation} onArchive={archiveConversation} onExport={exportConversation} />)}
                <div className="h-px bg-border/50 my-2 mx-3" />
              </>
            )}
            {recent.length > 0 && (
              <>
                {pinned.length > 0 && <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5">Recent</p>}
                {recent.map((conv) => <ConversationItem key={conv.id} conv={conv} pathname={pathname} onDelete={deleteConversation} onPin={pinConversation} onArchive={archiveConversation} onExport={exportConversation} />)}
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
    <div className={cn('group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent', isActive && 'bg-accent')}>
      <Link href={`/chat/${conv.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{conv.title}</p>
        <p className="text-[10px] text-muted-foreground">
          {format(new Date(conv.updatedAt), 'MMM d')} · {conv._count?.messages ?? 0} messages
        </p>
      </Link>

      {conv.isPinned && <Pin className="h-3 w-3 text-primary flex-shrink-0 opacity-60" />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => onPin({ id: conv.id, isPinned: !conv.isPinned })}>
            <Pin className="h-3.5 w-3.5" />{conv.isPinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport(conv.id, conv.title)}>
            <Download className="h-3.5 w-3.5" />Export
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onArchive(conv.id)}>
            <Archive className="h-3.5 w-3.5" />Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(conv.id)}>
            <Trash2 className="h-3.5 w-3.5" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
