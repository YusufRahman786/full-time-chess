'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { PLATFORM_LABELS, type GamesResponse, type NormalizedGame, type Platform } from '@/lib/chess/types'
import { SAMPLE_GAMES } from '@/lib/chess/sample-games'
import { PlatformConnect } from './platform-connect'
import { MatchList } from './match-list'
import { MatchCenter } from './commentary/match-center'

type Query = { platform: Exclude<Platform, 'sample'>; username: string }

async function fetchGames(url: string): Promise<GamesResponse> {
  const res = await fetch(url)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? 'Something went wrong fetching games.')
  return data as GamesResponse
}

export function MatchFinder() {
  const [query, setQuery] = useState<Query | null>(null)
  const [sampleMode, setSampleMode] = useState(false)
  const [selected, setSelected] = useState<NormalizedGame | null>(null)

  const key = query
    ? `/api/games?platform=${query.platform}&username=${encodeURIComponent(query.username)}`
    : null
  const { data, error, isLoading, mutate } = useSWR(key, fetchGames, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const games = sampleMode ? SAMPLE_GAMES : (data?.games ?? [])
  const username = sampleMode ? null : (data?.username ?? query?.username ?? null)

  return (
    <section id="find" aria-labelledby="find-heading" className="scroll-mt-14">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-widest text-primary">Team sheet</p>
            <h2 id="find-heading" className="font-display text-4xl font-black uppercase italic tracking-tight md:text-5xl">
              Find your fixture
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Pick your platform, enter a public username and we&apos;ll pull your latest games straight from the
            source.
          </p>
        </div>

        <PlatformConnect
          loading={isLoading}
          onSubmit={(platform, name) => {
            setSampleMode(false)
            setSelected(null)
            setQuery({ platform, username: name })
          }}
          onSample={() => {
            setQuery(null)
            setSelected(null)
            setSampleMode(true)
          }}
        />

        <div className="mt-10" aria-live="polite">
          {(query || sampleMode) && (
            <MatchList
              heading={
                sampleMode
                  ? 'Sample mode — the all-time classics'
                  : `${PLATFORM_LABELS[query!.platform]} · ${username}`
              }
              games={games}
              username={username}
              loading={!sampleMode && isLoading}
              error={!sampleMode ? (error as Error | undefined)?.message : undefined}
              onRetry={() => mutate()}
              selectedId={selected?.id}
              onSelect={setSelected}
            />
          )}
        </div>
      </div>

      {selected && <MatchCenter key={selected.id} game={selected} username={username} />}
    </section>
  )
}
