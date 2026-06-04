'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SourceReference } from '@/types'

interface Props {
  sources: SourceReference[]
}

export function SourceCitations({ sources }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (!sources.length) return null

  return (
    <div className="mt-3 border border-border/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/40 hover:bg-muted/70 transition-colors text-sm"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">
            {sources.length} Source{sources.length !== 1 ? 's' : ''} Referenced
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="divide-y divide-border/40">
          {sources.map((src, idx) => (
            <div key={idx} className="px-4 py-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {src.specNumber && (
                    <Badge variant="info" className="text-[10px] font-mono">
                      {src.specNumber}
                    </Badge>
                  )}
                  {src.release && (
                    <Badge variant="secondary" className="text-[10px]">
                      Rel-{src.release.replace('REL_', '')}
                    </Badge>
                  )}
                  <span className="text-xs font-medium text-foreground truncate max-w-[200px]">
                    {src.documentName}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {Math.round(src.relevanceScore * 100)}% match
                </span>
              </div>

              {src.section && (
                <p className="text-[10px] text-muted-foreground">§ {src.section}</p>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-mono bg-muted/30 rounded-md p-2">
                {src.excerpt}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
