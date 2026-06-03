'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { SourceCitations } from './SourceCitations'
import { Message, SourceReference } from '@/types'
import { format } from 'date-fns'

interface Props {
  message: Message
  isStreaming?: boolean
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 p-1 rounded bg-muted/80 hover:bg-muted transition-all"
      title="Copy code"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
    </button>
  )
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'
  const sources = (message.sources ?? []) as SourceReference[]

  return (
    <div className={cn('flex items-start gap-3 animate-fade-in', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
          isUser ? 'bg-secondary' : 'gradient-brand',
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-foreground" />
        ) : (
          <span className="text-white font-bold text-xs">5G</span>
        )}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[82%] space-y-2', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted rounded-tl-sm',
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className={cn('prose prose-sm dark:prose-invert max-w-none', isStreaming && 'streaming-cursor')}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const inline = !className
                    const match = /language-(\w+)/.exec(className ?? '')
                    const code = String(children).replace(/\n$/, '')

                    if (!inline && match) {
                      return (
                        <div className="relative group my-3 rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-800 border-b border-zinc-700">
                            <span className="text-[10px] text-zinc-400 font-mono uppercase">{match[1]}</span>
                            <CopyButton text={code} />
                          </div>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.75rem' }}
                            {...props}
                          >
                            {code}
                          </SyntaxHighlighter>
                        </div>
                      )
                    }
                    return (
                      <code className="bg-muted/80 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[0.8em] font-mono text-primary" {...props}>
                        {children}
                      </code>
                    )
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-3">
                        <table className="min-w-full border border-border rounded-lg text-xs">{children}</table>
                      </div>
                    )
                  },
                  th({ children }) {
                    return <th className="px-3 py-2 text-left bg-muted font-semibold border-b border-border">{children}</th>
                  },
                  td({ children }) {
                    return <td className="px-3 py-2 border-b border-border/50">{children}</td>
                  },
                  blockquote({ children }) {
                    return <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground my-2">{children}</blockquote>
                  },
                  strong({ children }) {
                    return <strong className="font-semibold text-foreground">{children}</strong>
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && sources.length > 0 && !isStreaming && (
          <SourceCitations sources={sources} />
        )}

        {/* Timestamp */}
        <p className={cn('text-[10px] text-muted-foreground px-1', isUser && 'text-right')}>
          {format(new Date(message.createdAt), 'HH:mm')}
          {message.tokenCount ? ` · ${message.tokenCount} tokens` : ''}
        </p>
      </div>
    </div>
  )
}

// Streaming variant — shows live content without sources
export function StreamingBubble({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white font-bold text-xs">5G</span>
      </div>
      <div className="max-w-[82%]">
        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
          <div className={cn('prose prose-sm dark:prose-invert max-w-none', content ? 'streaming-cursor' : '')}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ' '}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
