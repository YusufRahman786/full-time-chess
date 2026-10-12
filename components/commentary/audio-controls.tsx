'use client'

import { useId } from 'react'
import { Mic, MicOff, Users, UserX, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MatchAudio } from '@/hooks/use-match-audio'

interface Props {
  audio: MatchAudio
  playing: boolean
  className?: string
}

export function AudioControls({ audio, playing, className }: Props) {
  const status = !audio.soundOn
    ? 'Sound is off. Turn it on for spoken commentary and crowd noise.'
    : audio.blocked
      ? 'Your browser blocked audio. Tap "Allow audio" to try again.'
      : playing
        ? 'Live audio is on.'
        : 'Sound ready. Press Play to start the broadcast.'

  return (
    <section aria-label="Match audio" className={cn('rounded-lg border border-border bg-background p-3', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={audio.soundOn && !audio.blocked ? audio.disable : audio.enable}
          aria-pressed={audio.soundOn && !audio.blocked}
          className={cn(
            'inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-4 font-display text-sm font-extrabold uppercase italic tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            audio.soundOn && !audio.blocked
              ? 'border border-border bg-secondary text-foreground hover:bg-secondary/70'
              : 'bg-highlight text-highlight-foreground hover:opacity-90',
          )}
        >
          {audio.soundOn && !audio.blocked ? (
            <Volume2 className="size-4" aria-hidden="true" />
          ) : (
            <VolumeX className="size-4" aria-hidden="true" />
          )}
          {audio.blocked ? 'Allow audio' : audio.soundOn ? 'Sound on' : 'Turn sound on'}
        </button>
        <p className="min-w-0 flex-1 text-xs text-muted-foreground" aria-live="polite">
          {status}
        </p>
      </div>

      {audio.soundOn && (
        <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
          <VolumeRow
            label="Commentator"
            muted={audio.voiceMuted}
            volume={audio.voiceVolume}
            onMute={audio.setVoiceMuted}
            onVolume={audio.setVoiceVolume}
            disabled={!audio.speechSupported}
            OnIcon={Mic}
            OffIcon={MicOff}
          />
          <VolumeRow
            label="Crowd"
            muted={audio.crowdMuted}
            volume={audio.crowdVolume}
            onMute={audio.setCrowdMuted}
            onVolume={audio.setCrowdVolume}
            disabled={audio.blocked}
            OnIcon={Users}
            OffIcon={UserX}
          />
          {!audio.speechSupported && (
            <p className="text-xs text-highlight sm:col-span-2">
              Spoken commentary isn&apos;t supported in this browser. Crowd audio still works.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function VolumeRow({
  label,
  muted,
  volume,
  onMute,
  onVolume,
  disabled,
  OnIcon,
  OffIcon,
}: {
  label: string
  muted: boolean
  volume: number
  onMute: (muted: boolean) => void
  onVolume: (volume: number) => void
  disabled?: boolean
  OnIcon: typeof Mic
  OffIcon: typeof Mic
}) {
  const id = useId()
  const Icon = muted ? OffIcon : OnIcon
  return (
    <div className={cn('flex items-center gap-2', disabled && 'opacity-50')}>
      <button
        type="button"
        onClick={() => onMute(!muted)}
        disabled={disabled}
        aria-pressed={muted}
        aria-label={muted ? `Unmute ${label.toLowerCase()}` : `Mute ${label.toLowerCase()}`}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon className={cn('size-4', muted && 'text-muted-foreground')} aria-hidden="true" />
      </button>
      <label htmlFor={id} className="w-24 shrink-0 font-display text-xs font-bold uppercase tracking-widest">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={muted ? 0 : volume}
        disabled={disabled}
        onChange={(e) => {
          const next = Number(e.target.value)
          onVolume(next)
          if (muted && next > 0) onMute(false)
        }}
        className="min-w-0 flex-1 accent-[var(--primary)]"
      />
    </div>
  )
}
