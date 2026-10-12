import { cn } from '@/lib/utils'
import type { NormalizedGame } from '@/lib/chess/types'
import type { Frame } from '@/lib/commentary/engine'

interface Props {
  game: NormalizedGame
  frame: Frame
  finished: boolean
}

export function Scoreboard({ game, frame, finished }: Props) {
  const whiteShare = Math.min(90, Math.max(10, 50 + frame.material * 4))
  const isLive = !finished && frame.ply > 0

  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs">
        <span className="truncate font-display font-bold uppercase tracking-widest text-muted-foreground">
          {game.event ?? game.opening ?? 'Friendly fixture'}
        </span>
        <span
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-0.5 font-display font-black uppercase tracking-widest',
            finished ? 'bg-secondary text-foreground' : isLive ? 'bg-destructive text-white' : 'bg-secondary text-muted-foreground',
          )}
        >
          {isLive && <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />}
          {finished ? 'Full time' : isLive ? 'Live' : 'Pre-match'}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 md:gap-6 md:px-6">
        <TeamName name={game.white.name} rating={game.white.rating} side="Home" align="left" />
        <div className="flex flex-col items-center">
          <div
            className="flex items-center gap-2 font-display text-5xl font-black tabular-nums md:text-6xl"
            aria-label={`Goals: ${game.white.name} ${frame.score.white}, ${game.black.name} ${frame.score.black}`}
          >
            <span>{frame.score.white}</span>
            <span className="text-muted-foreground">:</span>
            <span>{frame.score.black}</span>
          </div>
          <span className="mt-1 rounded-sm bg-primary px-2 font-display text-sm font-black tabular-nums text-primary-foreground">
            {frame.minute}
          </span>
        </div>
        <TeamName name={game.black.name} rating={game.black.rating} side="Away" align="right" />
      </div>

      <div className="px-4 pb-4 md:px-6">
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">{whiteShare}%</span>
          <span className="font-display font-bold uppercase tracking-widest">Possession (material)</span>
          <span className="tabular-nums">{100 - whiteShare}%</span>
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
          <div className="bg-foreground transition-all duration-500" style={{ width: `${whiteShare}%` }} />
          <div className="flex-1 bg-primary" />
        </div>
        {finished && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Official chess result:{' '}
            <span className="font-semibold text-foreground">
              {game.result === '1/2-1/2' ? '½–½' : game.result}
            </span>
            {game.termination ? ` · ${game.termination}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}

function TeamName({
  name,
  rating,
  side,
  align,
}: {
  name: string
  rating?: number
  side: string
  align: 'left' | 'right'
}) {
  return (
    <div className={cn('min-w-0', align === 'right' && 'text-right')}>
      <p className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {side} · {align === 'left' ? 'White' : 'Black'}
      </p>
      <p className="truncate font-display text-xl font-extrabold uppercase italic tracking-tight md:text-3xl">{name}</p>
      {rating && <p className="text-xs tabular-nums text-muted-foreground">{rating}</p>}
    </div>
  )
}
