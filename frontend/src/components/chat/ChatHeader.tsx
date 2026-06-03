'use client'
import { Download, MoreVertical, Pin, Archive, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useConversations } from '@/hooks/useConversations'
import { Conversation } from '@/types'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface Props {
  conversation: Conversation | null
  onNewChat: () => void
}

export function ChatHeader({ conversation, onNewChat }: Props) {
  const { deleteConversation, renameConversation, pinConversation, archiveConversation, exportConversation } = useConversations()
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState('')

  const startRename = () => {
    setTitle(conversation?.title ?? '')
    setRenaming(true)
  }

  const commitRename = () => {
    if (conversation && title.trim()) {
      renameConversation({ id: conversation.id, title: title.trim() })
    }
    setRenaming(false)
  }

  return (
    <header className="h-14 border-b border-border px-4 flex items-center justify-between bg-card/80 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {conversation ? (
          renaming ? (
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false) }}
              className="h-7 text-sm max-w-xs"
            />
          ) : (
            <h2 className="font-semibold text-sm truncate max-w-sm">{conversation.title}</h2>
          )
        ) : (
          <h2 className="font-semibold text-sm text-muted-foreground">New Conversation</h2>
        )}
        {conversation?.isPinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
      </div>

      <div className="flex items-center gap-1">
        {conversation && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={startRename}>
                <Pencil className="h-4 w-4" />Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => pinConversation({ id: conversation.id, isPinned: !conversation.isPinned })}>
                <Pin className="h-4 w-4" />{conversation.isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportConversation(conversation.id, conversation.title)}>
                <Download className="h-4 w-4" />Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => archiveConversation(conversation.id)}>
                <Archive className="h-4 w-4" />Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteConversation(conversation.id)}
              >
                <Trash2 className="h-4 w-4" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
