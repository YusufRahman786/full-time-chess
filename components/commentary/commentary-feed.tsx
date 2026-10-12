import { cn } from '@/lib/utils'
import type { Frame, Intensity } from '@/lib/commentary/engine'

const ITEM_STYLES: Record<Intensity, string> = {
  goal: 'border-l-primary bg-primary/10',
  big: 'border-l-highlight bg-highlight/10',
  buildup: 'border-l-foreground/30',
  calm: 'border-l-transparent',
}

const TAG_STYLES: Record<Intensity, string> = {
  goal: 'bg-primary text-primary-foreground',
  big: 'bg-highlight text-highlight-foreground',
  buildup: 'bg-secondary text-foreground',
  calm: 'bg-secondary text-muted-foreground',
}

interface Props {
  frames: Frame[]
  currentIndex: number
  onJump: (index: number) => void
}

export function CommentaryFeed({ frames, currentIndex, onJump }: Props) {
  const visible = frames
    .map((frame, index) => ({ frame, index }))
    .slice(0, currentIndex + 1)
    .filter(({ frame, index }) => frame.showInFeed || index === currentIndex)
    .reverse()

  return (
    <ol className="flex flex-col gap-1.5" aria-label="Live commentary">
      {visible.map(({ frame, index }) => {
        const isCurrent = index === currentIndex
        return (
          <li key={index}>
            <button
              type="button"
              onClick={() => onJump(index)}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'grid w-full grid-cols-[3.25rem_1fr] gap-3 rounded-r-md border-l-4 px-3 py-3 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                ITEM_STYLES[frame.intensity],
                isCurrent && 'ring-1 ring-foreground/15',
              )}
            >
              <span className="font-display text-lg font-black tabular-nums leading-tight text-muted-foreground">
                {frame.minute}
              </span>
              <span className="flex flex-col gap-1.5">
                {(frame.tag || frame.san) && (
                  <span className="flex flex-wrap items-center gap-2">
                    {frame.tag && (
                      <span
                        className={cn(
                          'rounded-sm px-1.5 py-0.5 font-display text-xs font-black uppercase tracking-widest',
                          TAG_STYLES[frame.intensity],
                        )}
                      >
                        {frame.tag}
                      </span>
                    )}
                    {frame.san && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {Math.ceil(frame.ply / 2)}
                        {frame.color === 'w' ? '.' : '...'} {frame.san}
                      </span>
                    )}
                  </span>
                )}
                <span
                  className={cn(
                    'text-pretty leading-relaxed',
                    frame.intensity === 'calm' ? 'text-sm text-muted-foreground' : 'text-sm md:text-base',
                    frame.intensity === 'goal' && 'font-semibold',
                  )}
                >
                  {frame.text}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
