import 'server-only'
import { Chess } from 'chess.js'
import { ChessApiError, type GameResult, type NormalizedGame } from './types'

const BASE = 'https://api.chess.com/pub/player'
const HEADERS = { 'User-Agent': 'FullTimeChess/1.0 (fun football-commentary chess project)' }
const MAX_GAMES = 20

interface ChessComPlayer {
  username: string
  rating?: number
  result: string
}

interface ChessComGame {
  url: string
  uuid?: string
  pgn?: string
  end_time?: number
  time_control?: string
  time_class?: string
  rules?: string
  white: ChessComPlayer
  black: ChessComPlayer
}

async function getJson<T>(url: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, { headers: HEADERS, next: { revalidate: 120 } })
  } catch {
    throw new ChessApiError('Could not reach Chess.com. Please try again in a moment.', 502)
  }
  if (res.status === 404) {
    throw new ChessApiError('No Chess.com player found with that username.', 404)
  }
  if (res.status === 429) {
    throw new ChessApiError('Chess.com is rate limiting requests. Give it a minute and try again.', 429)
  }
  if (!res.ok) {
    throw new ChessApiError(`Chess.com returned an unexpected error (${res.status}).`, 502)
  }
  return res.json() as Promise<T>
}

function formatTimeControl(tc?: string): string | undefined {
  if (!tc) return undefined
  if (tc.includes('/')) {
    const seconds = Number(tc.split('/')[1])
    return Number.isFinite(seconds) ? `${Math.round(seconds / 86400)} day${seconds >= 172800 ? 's' : ''}/move` : tc
  }
  const [base, inc] = tc.split('+').map(Number)
  if (!Number.isFinite(base)) return tc
  const minutes = base >= 60 ? `${base / 60}` : `${base}s`
  return inc ? `${minutes}+${inc}` : `${minutes}+0`
}

function openingFromPgn(pgn: string): string | undefined {
  const match = pgn.match(/\[ECOUrl "[^"]*\/openings\/([^"]+)"\]/)
  if (!match) return undefined
  return decodeURIComponent(match[1]).replace(/-/g, ' ').replace(/\s+\d.*$/, '').trim()
}

function header(pgn: string, key: string): string | undefined {
  return pgn.match(new RegExp(`\\[${key} "([^"]*)"\\]`))?.[1]
}

function normalize(game: ChessComGame): NormalizedGame | null {
  if (!game.pgn || (game.rules && game.rules !== 'chess')) return null
  const chess = new Chess()
  try {
    chess.loadPgn(game.pgn)
  } catch {
    return null
  }
  const moves = chess.history()
  if (moves.length === 0) return null

  const result = (header(game.pgn, 'Result') ?? '*') as GameResult
  const fen = header(game.pgn, 'FEN')

  return {
    id: game.uuid ?? game.url,
    platform: 'chesscom',
    white: { name: game.white.username, rating: game.white.rating },
    black: { name: game.black.username, rating: game.black.rating },
    result,
    termination: header(game.pgn, 'Termination'),
    endedAt: game.end_time ? game.end_time * 1000 : undefined,
    timeControl: formatTimeControl(game.time_control),
    timeClass: game.time_class,
    opening: openingFromPgn(game.pgn),
    url: game.url,
    initialFen: fen,
    moves,
  }
}

export async function fetchChessComGames(username: string): Promise<NormalizedGame[]> {
  const { archives } = await getJson<{ archives: string[] }>(
    `${BASE}/${encodeURIComponent(username.toLowerCase())}/games/archives`,
  )
  if (!archives?.length) return []

  const games: NormalizedGame[] = []
  for (const archiveUrl of [...archives].reverse().slice(0, 3)) {
    const { games: monthGames } = await getJson<{ games: ChessComGame[] }>(archiveUrl)
    for (const g of [...monthGames].reverse()) {
      const normalized = normalize(g)
      if (normalized) games.push(normalized)
      if (games.length >= MAX_GAMES) return games
    }
  }
  return games
}
