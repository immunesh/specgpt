'use client'
import { motion } from 'framer-motion'
import { Download, MoreVertical, Pin, Archive, Trash2, Pencil, Sparkles } from 'lucide-react'
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

export function ChatHeader({ conversation, onNewChat: _onNewChat }: Props) {
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
    <header
      className="h-14 px-5 flex items-center justify-between flex-shrink-0"
      style={{
        background: 'rgba(7,13,28,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* AI indicator dot */}
        <div className="relative flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00AEEF, #0070F3)' }}
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#070D1C]"
            style={{ background: '#10B981' }}
          />
        </div>

        {conversation ? (
          renaming ? (
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') setRenaming(false)
              }}
              className="h-7 text-sm max-w-xs bg-white/5 border-white/20 text-white rounded-lg"
            />
          ) : (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-sm text-white/90 truncate max-w-sm"
            >
              {conversation.title}
            </motion.h2>
          )
        ) : (
          <h2 className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            New Conversation
          </h2>
        )}

        {conversation?.isPinned && (
          <Pin className="h-3 w-3 flex-shrink-0" style={{ color: '#00AEEF' }} />
        )}
      </div>

      <div className="flex items-center gap-1">
        {conversation && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              style={{
                background: 'rgba(10,16,35,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <DropdownMenuItem
                onClick={startRename}
                className="text-white/70 hover:text-white focus:text-white focus:bg-white/8"
              >
                <Pencil className="h-4 w-4" />Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => pinConversation({ id: conversation.id, isPinned: !conversation.isPinned })}
                className="text-white/70 hover:text-white focus:text-white focus:bg-white/8"
              >
                <Pin className="h-4 w-4" />{conversation.isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportConversation(conversation.id, conversation.title)}
                className="text-white/70 hover:text-white focus:text-white focus:bg-white/8"
              >
                <Download className="h-4 w-4" />Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.08)' }} />
              <DropdownMenuItem
                onClick={() => archiveConversation(conversation.id)}
                className="text-white/70 hover:text-white focus:text-white focus:bg-white/8"
              >
                <Archive className="h-4 w-4" />Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
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
