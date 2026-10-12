import 'server-only'
import { ChessApiError, type GameResult, type NormalizedGame } from './types'

const HEADERS = {
  'User-Agent': 'FullTimeChess/1.0 (fun football-commentary chess project)',
  Accept: 'application/x-ndjson',
}
const MAX_GAMES = 20
const SUPPORTED_VARIANTS = new Set(['standard', 'fromPosition'])

interface LichessPlayer {
  user?: { name: string; id: string }
  aiLevel?: number
  rating?: number
}

interface LichessGame {
  id: string
  variant: string
  speed?: string
  createdAt?: number
  lastMoveAt?: number
  status: string
  winner?: 'white' | 'black'
  moves?: string
  initialFen?: string
  clock?: { initial: number; increment: number }
  daysPerTurn?: number
  opening?: { name: string }
  tournament?: string
  arenaTour?: { name: string }
  players: { white: LichessPlayer; black: LichessPlayer }
}

const STATUS_LABELS: Record<string, string> = {
  mate: 'Checkmate',
  resign: 'Resignation',
  stalemate: 'Stalemate',
  timeout: 'Abandoned',
  outoftime: 'Time forfeit',
  draw: 'Draw agreed',
  noStart: 'Game never started',
  cheat: 'Cheat detected',
  variantEnd: 'Variant ending',
  insufficientMaterialClaim: 'Insufficient material',
}

function playerName(p: LichessPlayer): string {
  if (p.user) return p.user.name
  if (p.aiLevel) return `Stockfish level ${p.aiLevel}`
  return 'Anonymous'
}

function normalize(game: LichessGame): NormalizedGame | null {
  if (!SUPPORTED_VARIANTS.has(game.variant) || !game.moves) return null
  const moves = game.moves.trim().split(/\s+/)
  if (moves.length === 0) return null

  let result: GameResult = '1/2-1/2'
  if (game.winner === 'white') result = '1-0'
  else if (game.winner === 'black') result = '0-1'
  else if (game.status === 'started' || game.status === 'created') result = '*'

  const timeControl = game.clock
    ? `${game.clock.initial >= 60 ? game.clock.initial / 60 : `${game.clock.initial}s`}+${game.clock.increment}`
    : game.daysPerTurn
      ? `${game.daysPerTurn} day${game.daysPerTurn > 1 ? 's' : ''}/move`
      : undefined

  return {
    id: game.id,
    platform: 'lichess',
    white: { name: playerName(game.players.white), rating: game.players.white.rating },
    black: { name: playerName(game.players.black), rating: game.players.black.rating },
    result,
    termination: STATUS_LABELS[game.status] ?? game.status,
    endedAt: game.lastMoveAt ?? game.createdAt,
    timeControl,
    timeClass: game.speed,
    opening: game.opening?.name,
    event: game.arenaTour?.name,
    url: `https://lichess.org/${game.id}`,
    initialFen: game.initialFen,
    moves,
  }
}

export async function fetchLichessGames(username: string): Promise<NormalizedGame[]> {
  const params = new URLSearchParams({
    max: String(MAX_GAMES + 10),
    moves: 'true',
    opening: 'true',
    clocks: 'false',
    evals: 'false',
  })

  let res: Response
  try {
    res = await fetch(`https://lichess.org/api/games/user/${encodeURIComponent(username)}?${params}`, {
      headers: HEADERS,
      next: { revalidate: 120 },
    })
  } catch {
    throw new ChessApiError('Could not reach Lichess. Please try again in a moment.', 502)
  }

  if (res.status === 404) {
    throw new ChessApiError('No Lichess player found with that username.', 404)
  }
  if (res.status === 429) {
    throw new ChessApiError('Lichess is rate limiting requests. Give it a minute and try again.', 429)
  }
  if (!res.ok) {
    throw new ChessApiError(`Lichess returned an unexpected error (${res.status}).`, 502)
  }

  const text = await res.text()
  const games: NormalizedGame[] = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    try {
      const normalized = normalize(JSON.parse(line) as LichessGame)
      if (normalized) games.push(normalized)
    } catch {
      continue
    }
    if (games.length >= MAX_GAMES) break
  }
  return games
}
