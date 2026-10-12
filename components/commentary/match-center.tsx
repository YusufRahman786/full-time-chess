'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ExternalLink, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLATFORM_LABELS, type NormalizedGame } from '@/lib/chess/types'
import { buildCommentary, type Intensity } from '@/lib/commentary/engine'
import { ChessBoard } from './chess-board'
import { Scoreboard } from './scoreboard'
import { CommentaryFeed } from './commentary-feed'
import { PlaybackControls, type Speed } from './playback-controls'

const DELAYS: Record<Intensity, number> = { calm: 900, buildup: 1600, big: 2600, goal: 3400 }

interface Props {
  game: NormalizedGame
  username: string | null
}

export function MatchCenter({ game, username }: Props) {
  const commentary = useMemo(() => buildCommentary(game), [game])
  const { frames } = commentary
  const last = frames.length - 1

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState<Speed>(1)

  const frame = frames[Math.min(index, last)]
  const finished = index >= last

  useEffect(() => {
    if (!playing) return
    if (index >= last) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), DELAYS[frame.intensity] / speed)
    return () => clearTimeout(timer)
  }, [playing, index, last, speed, frame.intensity])

  const scrollOnMount = useCallback((el: HTMLDivElement | null) => {
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const lower = username?.toLowerCase()
  const orientation = lower && game.black.name.toLowerCase() === lower ? 'b' : 'w'

  const seek = (next: number) => {
    setPlaying(false)
    setIndex(Math.max(0, Math.min(last, next)))
  }

  return (
    <div
      id="match-center"
      ref={scrollOnMount}
      className="scroll-mt-14 border-t border-border bg-card/40"
      onKeyDown={(e) => {
        if (e.target instanceof HTMLInputElement) return
        if (e.key === 'ArrowRight') seek(index + 1)
        if (e.key === 'ArrowLeft') seek(index - 1)
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-3xl font-black uppercase italic tracking-tight md:text-4xl">
            <Mic className="size-7 text-primary" aria-hidden="true" />
            Match centre
          </h2>
          {game.url && (
            <a
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View on {PLATFORM_LABELS[game.platform]}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        <Scoreboard game={game} frame={frame} finished={finished} />

        {commentary.error && (
          <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-highlight/40 bg-highlight/10 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-highlight" aria-hidden="true" />
            <p>{commentary.error}</p>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                'flex min-h-24 items-start gap-3 rounded-lg border p-4 transition-colors',
                frame.intensity === 'goal'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : frame.intensity === 'big'
                    ? 'border-highlight bg-highlight text-highlight-foreground'
                    : 'border-border bg-background',
              )}
              aria-live="polite"
            >
              <span className="shrink-0 font-display text-2xl font-black tabular-nums leading-none">{frame.minute}</span>
              <p
                className={cn(
                  'text-pretty font-display text-xl font-bold leading-snug md:text-2xl',
                  (frame.intensity === 'goal' || frame.intensity === 'big') && 'italic',
                )}
              >
                {frame.text}
              </p>
            </div>

            <div className="mx-auto w-full max-w-[min(100%,36rem)]">
              <ChessBoard
                key={frame.intensity === 'goal' ? `flash-${index}` : 'board'}
                fen={frame.fen}
                orientation={orientation}
                lastMove={frame.lastMove}
                flash={frame.intensity === 'goal'}
              />
            </div>

            <PlaybackControls
              index={index}
              last={last}
              playing={playing}
              speed={speed}
              onSeek={seek}
              onSpeed={setSpeed}
              onTogglePlay={() => {
                if (!playing && index >= last) setIndex(0)
                setPlaying((p) => !p)
              }}
            />
          </div>

          <div className="flex min-h-0 flex-col rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-display text-lg font-extrabold uppercase italic tracking-wide">Live text</h3>
              <span className="text-xs text-muted-foreground">
                Move {Math.ceil(Math.min(frame.ply, commentary.totalPlies) / 2)} of {Math.ceil(commentary.totalPlies / 2)}
              </span>
            </div>
            <div className="max-h-[32rem] overflow-y-auto p-2 lg:max-h-[46rem]">
              <CommentaryFeed frames={frames} currentIndex={index} onJump={seek} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
