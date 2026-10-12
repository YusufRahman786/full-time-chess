'use client'

import type { KeyboardEvent, ReactNode, Ref } from 'react'
import { Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NormalizedGame } from '@/lib/chess/types'
import type { Frame } from '@/lib/commentary/engine'

interface Props {
  ref: Ref<HTMLDivElement>
  game: NormalizedGame
  frame: Frame
  finished: boolean
  board: ReactNode
  line: ReactNode
  controls: ReactNode
  audio: ReactNode
  feed: ReactNode
  moveLabel: string
  onExit: () => void
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void
}

export function ImmersiveView({
  ref,
  game,
  frame,
  finished,
  board,
  line,
  controls,
  audio,
  feed,
  moveLabel,
  onExit,
  onKeyDown,
}: Props) {
  const isLive = !finished && frame.ply > 0

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Full-screen match: ${game.white.name} vs ${game.black.name}`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[100] flex h-dvh flex-col bg-background text-foreground outline-none"
    >
      <header className="flex items-center gap-2 border-b border-border bg-card px-3 py-2 md:gap-4 md:px-6 md:py-3">
        <span
          className={cn(
            'hidden shrink-0 items-center gap-1.5 rounded-sm px-2 py-0.5 font-display text-xs font-black uppercase tracking-widest sm:flex',
            finished ? 'bg-secondary text-foreground' : isLive ? 'bg-destructive text-white' : 'bg-secondary text-muted-foreground',
          )}
        >
          {isLive && <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />}
          {finished ? 'Full time' : isLive ? 'Live' : 'Pre-match'}
        </span>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 font-display md:gap-4">
          <span className="min-w-0 flex-1 truncate text-right text-sm font-extrabold uppercase italic tracking-tight md:text-2xl">
            {game.white.name}
          </span>
          <span
            className="shrink-0 text-2xl font-black tabular-nums md:text-4xl"
            aria-label={`Score ${frame.score.white} to ${frame.score.black}`}
          >
            {frame.score.white}
            <span className="px-1 text-muted-foreground">:</span>
            {frame.score.black}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-extrabold uppercase italic tracking-tight md:text-2xl">
            {game.black.name}
          </span>
          <span className="shrink-0 rounded-sm bg-primary px-2 text-sm font-black tabular-nums text-primary-foreground md:text-base">
            {frame.minute}
          </span>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-background px-3 font-display text-sm font-extrabold uppercase italic tracking-wide transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Minimize2 className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Exit full screen</span>
          <span className="sr-only sm:hidden">Exit full screen</span>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row lg:gap-6 lg:p-6">
        <div className="flex h-[min(calc(100vw-1.5rem),50dvh)] shrink-0 items-center justify-center [container-type:size] lg:h-auto lg:min-h-0 lg:flex-1">
          <div className="w-[min(100cqw,100cqh)]">{board}</div>
        </div>

        <aside className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto lg:w-[26rem] lg:flex-none lg:overflow-visible xl:w-[30rem]">
          {line}
          <div className="hidden min-h-0 flex-1 flex-col rounded-lg border border-border bg-card/40 lg:flex">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h3 className="font-display text-base font-extrabold uppercase italic tracking-wide">Live text</h3>
              <span className="text-xs text-muted-foreground">{moveLabel}</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">{feed}</div>
          </div>
          {controls}
          {audio}
        </aside>
      </div>
    </div>
  )
}
