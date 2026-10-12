export type Platform = 'chesscom' | 'lichess' | 'sample'

export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*'

export interface PlayerInfo {
  name: string
  rating?: number
}

export interface NormalizedGame {
  id: string
  platform: Platform
  white: PlayerInfo
  black: PlayerInfo
  result: GameResult
  termination?: string
  endedAt?: number
  timeControl?: string
  timeClass?: string
  opening?: string
  event?: string
  url?: string
  initialFen?: string
  moves: string[]
}

export interface GamesResponse {
  platform: Platform
  username: string
  games: NormalizedGame[]
}

export class ChessApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  chesscom: 'Chess.com',
  lichess: 'Lichess',
  sample: 'Sample mode',
}

export const USERNAME_PATTERN = /^[A-Za-z0-9_-]{2,30}$/
