'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { chatApi } from '@/lib/api/chat'
import { cn } from '@/lib/utils/cn'

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

function ResultCard({ result }: { result: SearchResult }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {result.specNumber && <Badge variant="info" className="font-mono text-[10px]">{result.specNumber}</Badge>}
            {result.release && <Badge variant="secondary" className="text-[10px]">Rel-{result.release.replace('REL_', '')}</Badge>}
            {result.series && <Badge variant="outline" className="text-[10px]">{result.series.replace('_', ' ')}</Badge>}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0 font-medium">
            {Math.round(result.relevanceScore * 100)}% match
          </span>
        </div>

        <div>
          <p className="text-sm font-medium">{result.documentName}</p>
          {result.section && <p className="text-xs text-muted-foreground mt-0.5">§ {result.section}</p>}
          {result.pageNumber && <p className="text-xs text-muted-foreground">Page {result.pageNumber}</p>}
        </div>

        <div className={cn('text-xs text-muted-foreground font-mono bg-muted/40 rounded-lg p-3 leading-relaxed', !expanded && 'line-clamp-3')}>
          {result.excerpt}
        </div>

        {result.excerpt.length > 200 && (
          <button onClick={() => setExpanded((v) => !v)} className="text-xs text-primary flex items-center gap-1 hover:underline">
            {expanded ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Show more</>}
          </button>
        )}
      </CardContent>
    </Card>
  )
}

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
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border px-6 flex items-center flex-shrink-0">
        <h1 className="text-lg font-semibold">Specification Search</h1>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Semantic search across all uploaded 5G specification documents using AI embeddings.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search specifications… e.g. 'PDCCH scheduling NR' or 'AMF selection procedure'"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={query.trim().length < 3 || isFetching}>
                {isFetching ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </div>

          {isLoading || isFetching ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : data && data.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{data.length} results for <span className="font-medium text-foreground">"{submitted}"</span></p>
              </div>
              {data.map((r) => <ResultCard key={r.chunkId} result={r} />)}
            </div>
          ) : submitted && data?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No results found for "<strong>{submitted}</strong>"</p>
              <p className="text-xs text-muted-foreground mt-1">Try different terms or upload more specification documents.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
