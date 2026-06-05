'use client'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, User } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
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
      className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 p-1.5 rounded-lg transition-all"
      style={{ background: 'rgba(255,255,255,0.1)' }}
      title="Copy code"
    >
      {copied
        ? <Check className="h-3 w-3 text-emerald-400" />
        : <Copy className="h-3 w-3 text-white/50" />}
    </button>
  )
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'
  const sources = (message.sources ?? []) as SourceReference[]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
      className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
        )}
        style={
          isUser
            ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }
            : {
                background: 'linear-gradient(135deg, #00AEEF, #0070F3)',
                boxShadow: '0 0 12px rgba(0,174,239,0.3)',
              }
        }
      >
        {isUser ? (
          <User className="h-4 w-4 text-white/60" />
        ) : (
          <span className="text-white font-bold text-xs">5G</span>
        )}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[82%] space-y-2', isUser && 'items-end')}>
        <div
          className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed')}
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, rgba(0,174,239,0.2) 0%, rgba(0,112,243,0.2) 100%)',
                  border: '1px solid rgba(0,174,239,0.25)',
                  borderRadius: '18px 18px 4px 18px',
                  color: 'rgba(255,255,255,0.9)',
                }
              : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '18px 18px 18px 4px',
                  color: 'rgba(255,255,255,0.85)',
                }
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className={cn('prose prose-sm max-w-none', isStreaming && 'streaming-cursor')}
              style={{
                '--tw-prose-body': 'rgba(255,255,255,0.8)',
                '--tw-prose-headings': 'rgba(255,255,255,0.95)',
                '--tw-prose-lead': 'rgba(255,255,255,0.7)',
                '--tw-prose-links': '#00AEEF',
                '--tw-prose-bold': 'rgba(255,255,255,0.95)',
                '--tw-prose-counters': 'rgba(255,255,255,0.5)',
                '--tw-prose-bullets': 'rgba(255,255,255,0.4)',
                '--tw-prose-hr': 'rgba(255,255,255,0.1)',
                '--tw-prose-quotes': 'rgba(255,255,255,0.7)',
                '--tw-prose-quote-borders': '#00AEEF',
                '--tw-prose-captions': 'rgba(255,255,255,0.5)',
                '--tw-prose-code': '#00AEEF',
                '--tw-prose-pre-code': 'rgba(255,255,255,0.85)',
                '--tw-prose-pre-bg': 'rgba(0,0,0,0.4)',
                '--tw-prose-th-borders': 'rgba(255,255,255,0.15)',
                '--tw-prose-td-borders': 'rgba(255,255,255,0.08)',
              } as React.CSSProperties}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node: _node, className, children, ...props }) {
                    const inline = !className
                    const match = /language-(\w+)/.exec(className ?? '')
                    const code = String(children).replace(/\n$/, '')

                    if (!inline && match) {
                      return (
                        <div className="relative group my-3 rounded-xl overflow-hidden"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <div className="flex items-center justify-between px-4 py-2"
                            style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#00AEEF]/70">
                              {match[1]}
                            </span>
                            <CopyButton text={code} />
                          </div>
                          <SyntaxHighlighter
                            style={oneDark as unknown as { [key: string]: React.CSSProperties }}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.72rem', background: 'rgba(0,0,0,0.5)' }}
                          >
                            {code}
                          </SyntaxHighlighter>
                        </div>
                      )
                    }
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded text-[0.8em] font-mono"
                        style={{ background: 'rgba(0,174,239,0.12)', color: '#5BB8D4', border: '1px solid rgba(0,174,239,0.2)' }}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-3 rounded-xl"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <table className="min-w-full text-xs">{children}</table>
                      </div>
                    )
                  },
                  th({ children }) {
                    return (
                      <th className="px-3 py-2 text-left font-semibold"
                        style={{ background: 'rgba(0,174,239,0.1)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
                      >{children}</th>
                    )
                  },
                  td({ children }) {
                    return (
                      <td className="px-3 py-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }}
                      >{children}</td>
                    )
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="pl-4 italic my-2"
                        style={{ borderLeft: '3px solid #00AEEF', color: 'rgba(255,255,255,0.6)' }}
                      >{children}</blockquote>
                    )
                  },
                  strong({ children }) {
                    return <strong style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>{children}</strong>
                  },
                  a({ children, href }) {
                    return <a href={href} className="hover:underline" style={{ color: '#00AEEF' }}>{children}</a>
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
        <p
          className={cn('text-[10px] px-1', isUser && 'text-right')}
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {format(new Date(message.createdAt), 'HH:mm')}
          {message.tokenCount ? ` · ${message.tokenCount} tokens` : ''}
        </p>
      </div>
    </motion.div>
  )
}

export function StreamingBubble({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: 'linear-gradient(135deg, #00AEEF, #0070F3)',
          boxShadow: '0 0 12px rgba(0,174,239,0.3)',
        }}
      >
        <motion.span
          className="text-white font-bold text-xs"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          5G
        </motion.span>
      </div>
      <div className="max-w-[82%]">
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px 18px 18px 4px',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          <div className={cn('prose prose-sm max-w-none', content ? 'streaming-cursor' : '')}
            style={{ '--tw-prose-body': 'rgba(255,255,255,0.8)' } as React.CSSProperties}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ' '}</ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
