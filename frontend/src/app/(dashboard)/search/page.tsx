'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, ChevronDown, ChevronUp, Sparkles, FileText, Target } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { chatApi } from '@/lib/api/chat'

interface SearchResult {
  chunkId: string
  documentId: string
  documentName: string
  specNumber?: string | null
  release?: string | null
  series?: string | null
  section?: string | null
  pageNumber?: number | null
  excerpt: string
  relevanceScore: number
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#00AEEF' : '#F59E0B'
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div className="relative w-6 h-6">
        <svg viewBox="0 0 24 24" className="w-6 h-6 -rotate-90">
          <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
          <circle
            cx="12" cy="12" r="9"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={`${2 * Math.PI * 9}`}
            strokeDashoffset={`${2 * Math.PI * 9 * (1 - score)}`}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
          style={{ color }}
        >
          {pct}
        </span>
      </div>
    </div>
  )
}

function ResultCard({ result, index }: { result: SearchResult; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const pct = Math.round(result.relevanceScore * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 22 }}
      className="rounded-2xl overflow-hidden group"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
    >
      {/* Top section */}
      <div className="p-4 space-y-3">
        {/* Row 1: Badges + score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {result.specNumber && (
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-lg font-semibold"
                style={{ background: 'rgba(0,174,239,0.12)', border: '1px solid rgba(0,174,239,0.25)', color: '#5BB8D4' }}
              >
                {result.specNumber}
              </span>
            )}
            {result.release && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
              >
                Rel-{result.release.replace('REL_', '')}
              </span>
            )}
            {result.series && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#A78BFA' }}
              >
                {result.series.replace('_', ' ')}
              </span>
            )}
          </div>
          <ScoreBadge score={result.relevanceScore} />
        </div>

        {/* Row 2: Doc title + section */}
        <div className="flex items-start gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}
          >
            <FileText className="h-3.5 w-3.5" style={{ color: '#EC4899' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/85">{result.documentName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {result.section && (
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>§ {result.section}</span>
              )}
              {result.pageNumber && (
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>p.{result.pageNumber}</span>
              )}
            </div>
          </div>
        </div>

        {/* Excerpt */}
        <div
          className="rounded-xl p-3 text-xs leading-relaxed font-mono"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)' }}
        >
          <p className={expanded ? undefined : 'line-clamp-3'}>{result.excerpt}</p>
        </div>

        {result.excerpt.length > 200 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: '#00AEEF' }}
          >
            {expanded
              ? <><ChevronUp className="h-3 w-3" />Show less</>
              : <><ChevronDown className="h-3 w-3" />Show more</>}
          </button>
        )}
      </div>

      {/* Relevance bar */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0 16px 12px' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Relevance</span>
          <span className="text-[10px] font-semibold" style={{ color: pct >= 80 ? '#10B981' : pct >= 60 ? '#00AEEF' : '#F59E0B' }}>
            {pct}% match
          </span>
        </div>
        <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, delay: index * 0.05 + 0.3, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: pct >= 80
                ? 'linear-gradient(90deg, #10B981, #059669)'
                : pct >= 60
                  ? 'linear-gradient(90deg, #00AEEF, #0070F3)'
                  : 'linear-gradient(90deg, #F59E0B, #D97706)',
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

const EXAMPLE_QUERIES = [
  '5G NR initial registration procedure',
  'PDCCH CORESET configuration',
  'Network slice selection NSSAI',
  'SUPI concealment SUCI',
  'FR1 FR2 frequency bands',
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['semantic-search', submitted],
    queryFn: async () => {
      if (!submitted) return []
      const res = await chatApi.search({ q: submitted, limit: 15 })
      return (res.data.data ?? []) as SearchResult[]
    },
    enabled: !!submitted,
  })

  const handleSearch = () => {
    if (query.trim().length >= 3) setSubmitted(query.trim())
  }

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
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <Search className="h-4 w-4" style={{ color: '#7C3AED' }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-sm font-semibold text-white/90">Specification Search</h1>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Semantic AI search across 5G standards</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#A78BFA' }}
        >
          <Sparkles className="h-3 w-3" />
          Vector Search
        </motion.div>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ─── Search bar ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <div
              className="flex gap-2 p-1.5 rounded-2xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: query ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: query ? '0 0 20px rgba(124,58,237,0.1)' : 'none',
              }}
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 h-4 w-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  placeholder="Search 5G specifications… e.g. 'PDCCH scheduling NR'"
                  className="w-full h-10 pl-10 pr-4 bg-transparent text-sm outline-none"
                  style={{ color: 'rgba(255,255,255,0.85)', caretColor: '#7C3AED' }}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                disabled={query.trim().length < 3 || isFetching}
                className="h-10 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
                style={{
                  background: query.trim().length >= 3
                    ? 'linear-gradient(135deg, #7C3AED, #5B21B6)'
                    : 'rgba(255,255,255,0.06)',
                  color: 'white',
                  boxShadow: query.trim().length >= 3 ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                }}
              >
                {isFetching
                  ? <LoadingSpinner size="sm" />
                  : <Search className="h-3.5 w-3.5" />}
                Search
              </motion.button>
            </div>

            {/* Example queries */}
            {!submitted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuery(q); setSubmitted(q) }}
                    className="text-[11px] px-3 py-1.5 rounded-full transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* ─── Results ─── */}
          <AnimatePresence mode="wait">
            {isLoading || isFetching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  <Search className="h-5 w-5 animate-pulse" style={{ color: '#7C3AED' }} />
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Searching specifications…</p>
              </motion.div>
            ) : data && data.length > 0 ? (
              <motion.div key="results" className="space-y-4">
                {/* Result count */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" style={{ color: '#7C3AED' }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {data.length} results for{' '}
                    <span className="font-semibold text-white/80">"{submitted}"</span>
                  </p>
                  <span
                    className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.1)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.2)' }}
                  >
                    Sorted by relevance
                  </span>
                </motion.div>

                {data.map((r, i) => <ResultCard key={r.chunkId} result={r} index={i} />)}
              </motion.div>
            ) : submitted && data?.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Target className="h-7 w-7" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white/50">No results found</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Try different terms or upload more specification documents
                  </p>
                </div>
              </motion.div>
            ) : !submitted ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center justify-center py-20 gap-3 text-center"
              >
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(0,112,243,0.15))',
                    border: '1px solid rgba(124,58,237,0.2)',
                    boxShadow: '0 0 40px rgba(124,58,237,0.1)',
                  }}
                >
                  <Search className="h-7 w-7" style={{ color: '#7C3AED' }} />
                </div>
                <p className="text-sm font-medium text-white/50">Enter a query to search</p>
                <p className="text-xs max-w-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Powered by AI vector embeddings — finds semantically similar passages across all uploaded 5G specs
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
