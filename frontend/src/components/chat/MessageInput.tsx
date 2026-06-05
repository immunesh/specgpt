'use client'
import { useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onAbort?: () => void
  isStreaming: boolean
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ value, onChange, onSend, onAbort, isStreaming, disabled, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [value])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isStreaming && value.trim()) onSend()
    }
  }

  const canSend = !isStreaming && value.trim() && !disabled

  return (
    <div
      className="rounded-2xl transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: value
          ? '0 0 0 1px rgba(0,174,239,0.3), 0 0 20px rgba(0,174,239,0.08)'
          : '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Streaming indicator bar */}
      <AnimatePresence>
        {isStreaming && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            className="h-0.5 rounded-t-2xl origin-left"
            style={{ background: 'linear-gradient(90deg, #00AEEF, #0070F3, #7C3AED)' }}
          />
        )}
      </AnimatePresence>

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isStreaming}
        placeholder={
          placeholder
          ?? (isStreaming ? 'AI is responding…' : 'Ask a 5G specification question… (Enter to send)')
        }
        rows={1}
        className={cn(
          'w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm outline-none',
          'text-white/85 placeholder:text-white/25',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'min-h-[52px] max-h-[200px]',
        )}
      />

      <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
        {/* Status */}
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {isStreaming
            ? 'Streaming response…'
            : value.length > 0
              ? `${value.length} chars · Shift+Enter for new line`
              : '5G standards only'}
        </p>

        <div className="flex items-center gap-1.5">
          <AnimatePresence mode="wait">
            {isStreaming ? (
              <motion.button
                key="stop"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={onAbort}
                className="h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-white transition-all"
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#F87171',
                }}
              >
                <Square className="h-3 w-3 fill-current" />
                Stop
              </motion.button>
            ) : (
              <motion.button
                key="send"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={canSend ? { scale: 1.05 } : {}}
                whileTap={canSend ? { scale: 0.95 } : {}}
                type="button"
                disabled={!canSend}
                onClick={onSend}
                className="h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canSend
                    ? 'linear-gradient(135deg, #00AEEF, #0070F3)'
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: canSend ? '0 0 12px rgba(0,174,239,0.3)' : 'none',
                  border: canSend ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: canSend ? 'white' : 'rgba(255,255,255,0.4)',
                }}
              >
                <Send className="h-3 w-3" />
                Send
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
