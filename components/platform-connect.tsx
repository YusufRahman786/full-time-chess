'use client'

import { useId, useState } from 'react'
import { Loader2, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { USERNAME_PATTERN } from '@/lib/chess/types'

type LivePlatform = 'chesscom' | 'lichess'

const OPTIONS: { value: LivePlatform; label: string; hint: string }[] = [
  { value: 'chesscom', label: 'Chess.com', hint: 'Latest 20 games' },
  { value: 'lichess', label: 'Lichess', hint: 'Latest 20 games' },
]

interface Props {
  loading: boolean
  onSubmit: (platform: LivePlatform, username: string) => void
  onSample: () => void
}

export function PlatformConnect({ loading, onSubmit, onSample }: Props) {
  const [platform, setPlatform] = useState<LivePlatform>('chesscom')
  const [username, setUsername] = useState('')
  const [validation, setValidation] = useState<string | null>(null)
  const inputId = useId()
  const errorId = useId()

  return (
    <div className="rounded-lg border border-border bg-card p-5 md:p-8">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          const name = username.trim()
          if (!USERNAME_PATTERN.test(name)) {
            setValidation('Usernames are 2–30 characters: letters, numbers, underscores or hyphens.')
            return
          }
          setValidation(null)
          onSubmit(platform, name)
        }}
        className="flex flex-col gap-6"
      >
        <fieldset>
          <legend className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            1 · Choose your league
          </legend>
          <div role="radiogroup" className="grid grid-cols-2 gap-3">
            {OPTIONS.map((opt) => {
              const active = platform === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPlatform(opt.value)}
                  className={cn(
                    'flex flex-col items-start rounded-md border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/40 hover:border-foreground/30',
                  )}
                >
                  <span className="font-display text-xl font-extrabold uppercase italic tracking-tight md:text-2xl">
                    {opt.label}
                  </span>
                  <span className={cn('text-xs', active ? 'text-primary' : 'text-muted-foreground')}>{opt.hint}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor={inputId}
            className="mb-3 block font-display text-sm font-bold uppercase tracking-widest text-muted-foreground"
          >
            2 · Enter a username
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id={inputId}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={platform === 'chesscom' ? 'e.g. hikaru' : 'e.g. DrNykterstein'}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={validation ? true : undefined}
              aria-describedby={validation ? errorId : undefined}
              className="h-14 flex-1 rounded-md border border-input bg-background px-4 text-lg outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-primary px-7 font-display text-lg font-extrabold uppercase italic tracking-wide text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="size-5" aria-hidden="true" />
              )}
              {loading ? 'Scouting…' : 'Find my matches'}
            </button>
          </div>
          {validation && (
            <p id={errorId} className="mt-2 text-sm text-destructive">
              {validation}
            </p>
          )}
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">No account handy? Watch a legendary historic game instead.</p>
        <button
          type="button"
          onClick={onSample}
          className="inline-flex items-center gap-2 self-start font-semibold text-highlight underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          Try sample mode
        </button>
      </div>
    </div>
  )
}
