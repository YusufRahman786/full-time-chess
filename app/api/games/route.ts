import { NextResponse, type NextRequest } from 'next/server'
import { fetchChessComGames } from '@/lib/chess/chesscom'
import { fetchLichessGames } from '@/lib/chess/lichess'
import { ChessApiError, USERNAME_PATTERN, type GamesResponse } from '@/lib/chess/types'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const platform = searchParams.get('platform')
  const username = searchParams.get('username')?.trim() ?? ''

  if (platform !== 'chesscom' && platform !== 'lichess') {
    return NextResponse.json({ error: 'Choose Chess.com or Lichess.' }, { status: 400 })
  }
  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json(
      { error: 'Usernames are 2–30 characters: letters, numbers, underscores or hyphens.' },
      { status: 400 },
    )
  }

  try {
    const games =
      platform === 'chesscom' ? await fetchChessComGames(username) : await fetchLichessGames(username)
    const body: GamesResponse = { platform, username, games }
    return NextResponse.json(body)
  } catch (error) {
    if (error instanceof ChessApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[games] unexpected error', error)
    return NextResponse.json({ error: 'Something went wrong fetching games.' }, { status: 500 })
  }
}
