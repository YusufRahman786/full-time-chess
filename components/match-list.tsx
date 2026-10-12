'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import type { NormalizedGame } from '@/lib/chess/types'
import { MatchCard } from './match-card'

interface Props {
  heading: string
  games: NormalizedGame[]
  username: string | null
  loading: boolean
  error?: string
  onRetry: () => void
  selectedId?: string
  onSelect: (game: NormalizedGame) => void
}

export function MatchList({ heading, games, username, loading, error, onRetry, selectedId, onSelect }: Props) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl font-extrabold uppercase italic tracking-tight">{heading}</h3>
        {!loading && !error && games.length > 0 && (
          <span className="text-sm text-muted-foreground">{games.length} fixtures</span>
        )}
      </div>

      {loading && (
        <ul className="grid gap-3 md:grid-cols-2" aria-label="Loading games">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="h-36 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </ul>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-lg border border-destructive/40 bg-destructive/10 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <p className="font-display text-lg font-bold uppercase tracking-wide">Match postponed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary sm:self-auto"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="font-display text-lg font-bold uppercase tracking-wide">The fixture list is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t find any recent standard chess games for this player.
          </p>
        </div>
      )}

      {!loading && !error && games.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {games.map((game) => (
            <li key={game.id}>
              <MatchCard
                game={game}
                username={username}
                selected={game.id === selectedId}
                onSelect={() => onSelect(game)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
