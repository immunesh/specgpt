'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, BookOpen, FileText } from 'lucide-react'
import { SourceReference } from '@/types'

interface Props {
  sources: SourceReference[]
}

export function SourceCitations({ sources }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!sources.length) return null

  return (
    <div
      className="mt-2 rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(0,174,239,0.15)', background: 'rgba(0,174,239,0.03)' }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-all group"
        style={{ background: expanded ? 'rgba(0,174,239,0.07)' : 'transparent' }}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" style={{ color: '#00AEEF' }} />
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {sources.length} Source{sources.length !== 1 ? 's' : ''} Referenced
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(0,174,239,0.12)', color: '#5BB8D4', border: '1px solid rgba(0,174,239,0.2)' }}
          >
            RAG
          </span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {sources.map((src, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 space-y-2"
                  style={{
                    borderBottom: idx < sources.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}
                      >
                        <FileText className="h-3 w-3" style={{ color: '#EC4899' }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {src.specNumber && (
                            <span
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold"
                              style={{ background: 'rgba(0,174,239,0.1)', border: '1px solid rgba(0,174,239,0.2)', color: '#5BB8D4' }}
                            >
                              {src.specNumber}
                            </span>
                          )}
                          {src.release && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-md"
                              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
                            >
                              Rel-{src.release.replace('REL_', '')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {src.documentName}
                        </p>
                        {src.section && (
                          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            § {src.section}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <span
                      className="text-[10px] font-semibold flex-shrink-0 px-1.5 py-0.5 rounded-md"
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        color: '#10B981',
                        border: '1px solid rgba(16,185,129,0.2)',
                      }}
                    >
                      {Math.round(src.relevanceScore * 100)}%
                    </span>
                  </div>

                  {/* Excerpt */}
                  <div
                    className="text-[11px] leading-relaxed font-mono rounded-lg p-2.5 line-clamp-3"
                    style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    {src.excerpt}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
