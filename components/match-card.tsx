'use client'

import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NormalizedGame } from '@/lib/chess/types'

interface Props {
  game: NormalizedGame
  username: string | null
  selected: boolean
  onSelect: () => void
}

function outcomeFor(game: NormalizedGame, username: string | null): 'W' | 'L' | 'D' | null {
  if (!username || game.result === '*') return null
  const lower = username.toLowerCase()
  const side =
    game.white.name.toLowerCase() === lower ? 'w' : game.black.name.toLowerCase() === lower ? 'b' : null
  if (!side) return null
  if (game.result === '1/2-1/2') return 'D'
  return (game.result === '1-0') === (side === 'w') ? 'W' : 'L'
}

const OUTCOME_STYLES = {
  W: 'bg-primary text-primary-foreground',
  L: 'bg-destructive text-white',
  D: 'bg-muted-foreground text-background',
}

function formatDate(ms?: number) {
  if (!ms) return null
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(ms),
  )
}

export function MatchCard({ game, username, selected, onSelect }: Props) {
  const outcome = outcomeFor(game, username)
  const [whiteScore, blackScore] =
    game.result === '1-0' ? ['1', '0'] : game.result === '0-1' ? ['0', '1'] : game.result === '*' ? ['–', '–'] : ['½', '½']
  const moves = Math.ceil(game.moves.length / 2)
  const meta = [formatDate(game.endedAt), game.timeControl, `${moves} moves`].filter(Boolean)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group flex w-full flex-col gap-4 rounded-lg border bg-card p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-5',
        selected ? 'border-primary' : 'border-border hover:border-foreground/25',
      )}
    >
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="truncate">{meta.join(' · ')}</span>
        {outcome && (
          <span
            className={cn('rounded-sm px-1.5 py-0.5 font-display text-xs font-black', OUTCOME_STYLES[outcome])}
            aria-label={outcome === 'W' ? 'Win' : outcome === 'L' ? 'Loss' : 'Draw'}
          >
            {outcome}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <PlayerSide name={game.white.name} rating={game.white.rating} color="white" align="left" />
        <div className="flex items-center gap-1 rounded-md bg-background px-3 py-1.5 font-display text-2xl font-black tabular-nums">
          <span>{whiteScore}</span>
          <span className="text-muted-foreground">-</span>
          <span>{blackScore}</span>
        </div>
        <PlayerSide name={game.black.name} rating={game.black.rating} color="black" align="right" />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="truncate text-sm text-muted-foreground">
          {game.opening ?? game.event ?? game.termination ?? 'Standard chess'}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 font-display text-sm font-bold uppercase tracking-wide text-primary">
          <Play className="size-3.5 fill-current" aria-hidden="true" />
          {selected ? 'Watching' : 'Watch'}
        </span>
      </div>
    </button>
  )
}

function PlayerSide({
  name,
  rating,
  color,
  align,
}: {
  name: string
  rating?: number
  color: 'white' | 'black'
  align: 'left' | 'right'
}) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', align === 'right' && 'flex-row-reverse text-right')}>
      <span
        className={cn(
          'size-3 shrink-0 rounded-full border',
          color === 'white' ? 'border-foreground/40 bg-foreground' : 'border-foreground/40 bg-background',
        )}
        aria-label={`${color} pieces`}
      />
      <div className="min-w-0">
        <p className="truncate font-semibold">{name}</p>
        {rating && <p className="text-xs tabular-nums text-muted-foreground">{rating}</p>}
      </div>
    </div>
  )
}
