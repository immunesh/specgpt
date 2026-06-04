'use client'
import { useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  // Auto-resize textarea
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

  return (
    <div className="border border-border rounded-2xl bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-all">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isStreaming}
        placeholder={placeholder ?? 'Ask a 5G specification question… (Enter to send, Shift+Enter for new line)'}
        rows={1}
        className={cn(
          'w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm outline-none placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'min-h-[48px] max-h-[200px]',
        )}
      />
      <div className="flex items-center justify-between px-3 pb-2 pt-1">
        <p className="text-[10px] text-muted-foreground">
          {isStreaming ? 'Streaming response…' : value.length > 0 ? `${value.length} chars · Shift+Enter for new line` : '5G questions only'}
        </p>
        <div className="flex items-center gap-1">
          {isStreaming ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 gap-1.5 text-xs"
              onClick={onAbort}
            >
              <Square className="h-3 w-3 fill-current" />
              Stop
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={!value.trim() || disabled}
              onClick={onSend}
            >
              <Send className="h-3 w-3" />
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
