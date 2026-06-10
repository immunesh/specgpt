'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow, format } from 'date-fns'
import {
  History, MessageSquare, Pin, Search, Archive,
  Trash2, MoreVertical, ArrowRight, Download,
  MessagesSquare, Clock, SortDesc,
} from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { useConversations } from '@/hooks/useConversations'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Conversation } from '@/types'

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.045, type: 'spring', stiffness: 280, damping: 24 },
  }),
}

function ConversationCard({
  conv,
  index,
  onDelete,
  onPin,
  onArchive,
  onExport,
}: {
  conv: Conversation
  index: number
  onDelete: (id: string) => void
  onPin: (args: { id: string; isPinned: boolean }) => void
  onArchive: (id: string) => void
  onExport: (id: string, title: string) => void
}) {
  const firstUserMsg = conv.messages?.find((m) => m.role === 'user')
  const msgCount = conv._count?.messages ?? 0
  const updatedAgo = formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })
  const createdFmt = format(new Date(conv.createdAt), 'MMM d, yyyy')

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.97 }}
      className="group relative rounded-2xl overflow-hidden transition-all"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
      }}
    >
      {/* Pin accent bar */}
      {conv.isPinned && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl"
          style={{ background: 'linear-gradient(180deg, #00AEEF, #0070F3)' }}
        />
      )}

      <div className="flex items-start gap-4 p-4 pl-5">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: conv.isPinned ? 'rgba(0,174,239,0.12)' : 'rgba(255,255,255,0.04)',
            border: conv.isPinned ? '1px solid rgba(0,174,239,0.25)' : '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <MessageSquare
            className="h-4.5 w-4.5"
            style={{ color: conv.isPinned ? '#00AEEF' : 'rgba(255,255,255,0.3)' }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold truncate text-white/85">{conv.title}</h3>
                {conv.isPinned && (
                  <span
                    className="flex-shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,174,239,0.1)', border: '1px solid rgba(0,174,239,0.2)', color: '#5BB8D4' }}
                  >
                    <Pin className="h-2.5 w-2.5" /> Pinned
                  </span>
                )}
              </div>

              {/* Preview */}
              {firstUserMsg && (
                <p className="text-xs leading-relaxed line-clamp-2 mb-2.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {firstUserMsg.content}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="flex items-center gap-1 text-[11px]"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  <MessagesSquare className="h-3 w-3" />
                  {msgCount} message{msgCount !== 1 ? 's' : ''}
                </span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <span
                  className="flex items-center gap-1 text-[11px]"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  <Clock className="h-3 w-3" />
                  {updatedAgo}
                </span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Created {createdFmt}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Open button */}
              <Link href={`/chat/${conv.id}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium opacity-0 group-hover:opacity-100 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,174,239,0.15), rgba(0,112,243,0.15))',
                    border: '1px solid rgba(0,174,239,0.3)',
                    color: '#5BB8D4',
                  }}
                >
                  Open <ArrowRight className="h-3 w-3" />
                </motion.div>
              </Link>

              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-8 w-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <MoreVertical className="h-3.5 w-3.5 text-white/50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44"
                  style={{ background: 'rgba(10,16,35,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
                >
                  <DropdownMenuItem
                    onClick={() => onPin({ id: conv.id, isPinned: !conv.isPinned })}
                    className="text-white/70 hover:text-white focus:text-white focus:bg-white/8"
                  >
                    <Pin className="h-3.5 w-3.5" />
                    {conv.isPinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onExport(conv.id, conv.title)}
                    className="text-white/70 hover:text-white focus:text-white focus:bg-white/8"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onArchive(conv.id)}
                    className="text-white/70 hover:text-white focus:text-white focus:bg-white/8"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                    onClick={() => onDelete(conv.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function HistoryPageClient() {
  const { conversations } = useChatStore()
  const { deleteConversation, pinConversation, archiveConversation, exportConversation, isLoading } = useConversations()
  const [search, setSearch] = useState('')
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)

  const filtered = conversations.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase())
    const matchPin = !showPinnedOnly || c.isPinned
    return matchSearch && matchPin
  })

  const pinned = filtered.filter((c) => c.isPinned)
  const recent = filtered.filter((c) => !c.isPinned)
  const totalPinned = conversations.filter((c) => c.isPinned).length
  const total = conversations.length

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #070D1C 0%, #080F1E 100%)' }}>
      {/* ─── Header ─── */}
      <header
        className="h-16 px-6 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(91,184,212,0.15)', border: '1px solid rgba(91,184,212,0.3)' }}
          >
            <History className="h-4 w-4" style={{ color: '#5BB8D4' }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-sm font-semibold text-white/90">Conversation History</h1>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>All your past 5G spec chats</p>
          </motion.div>
        </div>

        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
            >
              <SortDesc className="h-3 w-3" />
              {total} total
            </div>
            {totalPinned > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                style={{ background: 'rgba(0,174,239,0.08)', border: '1px solid rgba(0,174,239,0.2)', color: '#5BB8D4' }}
              >
                <Pin className="h-3 w-3" />
                {totalPinned} pinned
              </div>
            )}
          </motion.div>
        )}
      </header>

      {/* ─── Toolbar ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <input
            placeholder="Search conversations…"
            className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all placeholder:text-white/20"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${search ? 'rgba(91,184,212,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: 'rgba(255,255,255,0.85)',
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Pinned filter */}
        {totalPinned > 0 && (
          <button
            onClick={() => setShowPinnedOnly((v) => !v)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium transition-all"
            style={{
              background: showPinnedOnly ? 'rgba(0,174,239,0.12)' : 'rgba(255,255,255,0.04)',
              border: showPinnedOnly ? '1px solid rgba(0,174,239,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: showPinnedOnly ? '#5BB8D4' : 'rgba(255,255,255,0.45)',
            }}
          >
            <Pin className="h-3 w-3" />
            Pinned only
          </button>
        )}
      </motion.div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading && !conversations.length ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(91,184,212,0.1)', border: '1px solid rgba(91,184,212,0.2)' }}
            >
              <History className="h-5 w-5 animate-pulse" style={{ color: '#5BB8D4' }} />
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Loading conversations…</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4 text-center"
          >
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(91,184,212,0.08)', border: '1px solid rgba(91,184,212,0.15)' }}
            >
              <MessageSquare className="h-7 w-7" style={{ color: 'rgba(91,184,212,0.4)' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/50">
                {search ? 'No matching conversations' : 'No conversations yet'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {search
                  ? 'Try a different search term'
                  : 'Start a chat to see your history here'}
              </p>
            </div>
            {!search && (
              <Link href="/chat">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,174,239,0.15), rgba(0,112,243,0.15))',
                    border: '1px solid rgba(0,174,239,0.3)',
                    color: '#5BB8D4',
                  }}
                >
                  Start a chat <ArrowRight className="h-3.5 w-3.5" />
                </motion.div>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Pinned section */}
            {pinned.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Pin className="h-3 w-3" style={{ color: '#00AEEF' }} />
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Pinned
                  </span>
                </div>
                <AnimatePresence mode="popLayout">
                  <div className="space-y-2">
                    {pinned.map((conv, i) => (
                      <ConversationCard
                        key={conv.id}
                        conv={conv}
                        index={i}
                        onDelete={deleteConversation}
                        onPin={pinConversation}
                        onArchive={archiveConversation}
                        onExport={exportConversation}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}

            {/* Recent section */}
            {recent.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Recent
                    </span>
                  </div>
                )}
                <AnimatePresence mode="popLayout">
                  <div className="space-y-2">
                    {recent.map((conv, i) => (
                      <ConversationCard
                        key={conv.id}
                        conv={conv}
                        index={pinned.length + i}
                        onDelete={deleteConversation}
                        onPin={pinConversation}
                        onArchive={archiveConversation}
                        onExport={exportConversation}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
