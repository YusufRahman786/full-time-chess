import { cn } from '@/lib/utils'
import type { Frame } from '@/lib/commentary/engine'

export function CurrentLine({ frame, large = false }: { frame: Frame; large?: boolean }) {
  const loud = frame.intensity === 'goal' || frame.intensity === 'big'
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 transition-colors',
        large ? 'min-h-28' : 'min-h-24',
        frame.intensity === 'goal'
          ? 'border-primary bg-primary text-primary-foreground'
          : frame.intensity === 'big'
            ? 'border-highlight bg-highlight text-highlight-foreground'
            : 'border-border bg-background',
      )}
      aria-live="polite"
    >
      <div className="flex shrink-0 flex-col gap-1">
        <span className="font-display text-2xl font-black tabular-nums leading-none">{frame.minute}</span>
        {frame.san && <span className="font-mono text-xs font-bold opacity-80">{frame.san}</span>}
      </div>
      <div className="min-w-0">
        {frame.tag && (
          <p className="mb-1 font-display text-xs font-black uppercase tracking-widest opacity-80">{frame.tag}</p>
        )}
        <p
          className={cn(
            'text-pretty font-display font-bold leading-snug',
            large ? 'text-xl md:text-2xl xl:text-3xl' : 'text-xl md:text-2xl',
            loud && 'italic',
          )}
        >
          {frame.text}
        </p>
      </div>
    </div>
  )
}
