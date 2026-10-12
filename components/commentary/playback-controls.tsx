import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

export const SPEEDS = [1, 2, 4] as const
export type Speed = (typeof SPEEDS)[number]

interface Props {
  index: number
  last: number
  playing: boolean
  speed: Speed
  onTogglePlay: () => void
  onSeek: (index: number) => void
  onSpeed: (speed: Speed) => void
}

const iconBtn =
  'inline-flex size-10 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-secondary disabled:opacity-40 disabled:hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function PlaybackControls({ index, last, playing, speed, onTogglePlay, onSeek, onSpeed }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="range"
        min={0}
        max={last}
        value={index}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Match timeline"
        className="w-full accent-[var(--primary)]"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" className={iconBtn} onClick={() => onSeek(0)} disabled={index === 0} aria-label="Back to kick-off">
            <SkipBack className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => onSeek(index - 1)}
            disabled={index === 0}
            aria-label="Previous move"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={playing ? 'Pause commentary' : 'Play commentary'}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 font-display text-base font-extrabold uppercase italic tracking-wide text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
          >
            {playing ? (
              <Pause className="size-4 fill-current" aria-hidden="true" />
            ) : (
              <Play className="size-4 fill-current" aria-hidden="true" />
            )}
            {playing ? 'Pause' : index >= last ? 'Replay' : 'Play'}
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => onSeek(index + 1)}
            disabled={index >= last}
            aria-label="Next move"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
          <button type="button" className={iconBtn} onClick={() => onSeek(last)} disabled={index >= last} aria-label="Skip to full time">
            <SkipForward className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div role="group" aria-label="Playback speed" className="flex rounded-md border border-border bg-background p-0.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeed(s)}
              aria-pressed={speed === s}
              className={cn(
                'rounded-sm px-2.5 py-1.5 font-display text-sm font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                speed === s ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
