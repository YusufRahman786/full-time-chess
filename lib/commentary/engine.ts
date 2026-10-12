import { Chess, type Color, type Move, type PieceSymbol, type Square } from 'chess.js'
import type { NormalizedGame } from '@/lib/chess/types'
import { FULL_TIME, LINES, type LineKey } from './lines'

export type Intensity = 'calm' | 'buildup' | 'big' | 'goal'

export interface Frame {
  ply: number
  san?: string
  color?: Color
  fen: string
  lastMove?: { from: Square; to: Square }
  minute: string
  text: string
  tag?: string
  intensity: Intensity
  score: { white: number; black: number }
  material: number
  showInFeed: boolean
}

export interface Commentary {
  frames: Frame[]
  totalPlies: number
  error?: string
}

const VALUES: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 }
const NAMES: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function fill(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => tokens[key] ?? '')
}

function materialBalance(chess: Chess): number {
  let total = 0
  for (const row of chess.board()) {
    for (const sq of row) {
      if (!sq || sq.type === 'k') continue
      total += sq.color === 'w' ? VALUES[sq.type] : -VALUES[sq.type]
    }
  }
  return total
}

function formatMinute(ply: number, total: number): string {
  const raw = Math.max(1, Math.round((ply / Math.max(total, 1)) * 93))
  return raw > 90 ? `90+${raw - 90}'` : `${raw}'`
}

function isHanging(chess: Chess, move: Move): boolean {
  const opponent: Color = move.color === 'w' ? 'b' : 'w'
  const attackers = chess.attackers(move.to, opponent)
  if (attackers.length === 0) return false
  const defended = chess.attackers(move.to, move.color).length > 0
  if (!defended) return true
  const movedValue = VALUES[move.promotion ?? move.piece]
  const cheapestAttacker = Math.min(...attackers.map((sq) => VALUES[chess.get(sq)?.type ?? 'k']))
  return cheapestAttacker < movedValue
}

export function buildCommentary(game: NormalizedGame): Commentary {
  const chess = new Chess()
  if (game.initialFen) {
    try {
      chess.load(game.initialFen)
    } catch {
      return { frames: [], totalPlies: 0, error: 'This game starts from a position we could not read.' }
    }
  }

  const seed = hash(game.id)
  const total = game.moves.length
  const names = { w: game.white.name, b: game.black.name }
  const winnerColor: Color | null = game.result === '1-0' ? 'w' : game.result === '0-1' ? 'b' : null
  const pick = (key: LineKey, ply: number, tokens: Record<string, string>) => {
    const pool = LINES[key]
    return fill(pool[(seed + ply * 31) % pool.length], tokens)
  }

  const score = { white: 0, black: 0 }
  const frames: Frame[] = [
    {
      ply: 0,
      fen: chess.fen(),
      minute: "0'",
      text: `Welcome to the theatre of dreams! ${names.w} in white, ${names.b} in black${
        game.event ? ` — live from ${game.event}` : ''
      }. The players are in the tunnel...`,
      tag: 'PRE-MATCH',
      intensity: 'buildup',
      score: { ...score },
      material: 0,
      showInFeed: true,
    },
  ]

  let pendingBait: { square: Square; byColor: Color } | null = null
  let lastGoal: { color: Color; ply: number } | null = null
  let lastQueenCapture: { color: Color; ply: number } | null = null
  let dominantAnnounced: Color | null = null
  let openingAnnounced = false
  let quietStreak = 0

  for (let i = 0; i < total; i++) {
    const ply = i + 1
    let move: Move
    try {
      move = chess.move(game.moves[i])
    } catch {
      return {
        frames,
        totalPlies: i,
        error: `We lost the broadcast feed at move ${Math.ceil(ply / 2)} — this game contains a move we could not replay.`,
      }
    }

    const mover = names[move.color]
    const opp = names[move.color === 'w' ? 'b' : 'w']
    const tokens = {
      p: mover,
      o: opp,
      san: move.san,
      sq: move.to,
      piece: NAMES[move.promotion ?? move.piece],
      cap: move.captured ? NAMES[move.captured] : '',
      PIECE: NAMES[move.promotion ?? move.piece].toUpperCase(),
      CAP: move.captured ? NAMES[move.captured].toUpperCase() : '',
      opening: game.opening ?? '',
    }
    const material = materialBalance(chess)

    let text = ''
    let tag: string | undefined
    let intensity: Intensity = 'calm'
    let showInFeed = true

    const capturedValue = move.captured ? VALUES[move.captured] : 0
    const movedValue = VALUES[move.promotion ?? move.piece]
    const baitWasHere = pendingBait && pendingBait.square === move.to && move.captured
    const hadBait = pendingBait
    pendingBait = null

    if (chess.isCheckmate()) {
      text = pick('checkmate', ply, tokens)
      tag = 'WINNER'
      intensity = 'goal'
      if (move.color === 'w') score.white++
      else score.black++
    } else if (chess.isStalemate()) {
      text = pick('stalemate', ply, tokens)
      tag = 'STALEMATE'
      intensity = 'big'
    } else if (move.promotion) {
      text = pick('promotion', ply, tokens)
      tag = 'PROMOTION'
      intensity = 'big'
    } else if (move.isEnPassant()) {
      text = pick('enPassant', ply, tokens)
      tag = 'VAR CHECK'
      intensity = 'big'
    } else if (
      movedValue >= 3 &&
      movedValue < 100 &&
      movedValue - capturedValue >= 2 &&
      isHanging(chess, move)
    ) {
      const key: LineKey =
        winnerColor === move.color ? 'sacrifice' : winnerColor === null ? 'gamble' : 'blunder'
      text = pick(key, ply, tokens)
      tag = key === 'sacrifice' ? 'SACRIFICE' : key === 'blunder' ? 'HOWLER' : 'GAMBLE'
      intensity = 'big'
      pendingBait = { square: move.to, byColor: move.color }
      if (move.captured && capturedValue >= 3) {
        if (move.color === 'w') score.white++
        else score.black++
      }
    } else if (move.captured && capturedValue >= 3) {
      if (move.color === 'w') score.white++
      else score.black++
      const isQueenTrade =
        move.captured === 'q' && lastQueenCapture && lastQueenCapture.ply === ply - 1
      if (baitWasHere) {
        text = pick('baitTaken', ply, tokens)
        tag = 'GOAL'
      } else if (lastGoal && lastGoal.ply === ply - 1 && lastGoal.color !== move.color) {
        text = pick('recapture', ply, tokens)
        tag = 'EQUALISER'
      } else {
        text = pick(
          move.captured === 'q' ? 'captureQueen' : move.captured === 'r' ? 'captureRook' : 'captureMinor',
          ply,
          tokens,
        )
        tag = 'GOAL'
      }
      if (isQueenTrade) text += ` ${LINES.queenTrade[0]}`
      if (move.captured === 'q') lastQueenCapture = { color: move.color, ply }
      intensity = 'goal'
      lastGoal = { color: move.color, ply }
      if (chess.inCheck()) text += ' And it comes WITH CHECK!'
    } else if (chess.inCheck()) {
      text = pick('check', ply, tokens)
      tag = 'CHECK'
      intensity = 'big'
    } else if (baitWasHere) {
      text = pick('baitTaken', ply, tokens)
      tag = 'BAIT TAKEN'
      intensity = 'big'
    } else if (hadBait && hadBait.byColor !== move.color) {
      text = pick('baitDeclined', ply, tokens)
      intensity = 'buildup'
    } else if (move.isKingsideCastle()) {
      text = pick('castleKing', ply, tokens)
      tag = 'CASTLE'
      intensity = 'buildup'
    } else if (move.isQueensideCastle()) {
      text = pick('castleQueen', ply, tokens)
      tag = 'CASTLE'
      intensity = 'buildup'
    } else if (move.captured) {
      text = pick('capturePawn', ply, tokens)
      intensity = 'buildup'
    } else if (ply === 1 && !game.initialFen) {
      text = pick('kickoff', ply, tokens)
      tag = 'KICK-OFF'
      intensity = 'buildup'
    } else if (ply === 2 && !game.initialFen) {
      text = pick('reply', ply, tokens)
    } else if (!openingAnnounced && game.opening && ply >= 4) {
      openingAnnounced = true
      text = `${pick(move.piece === 'p' ? 'pawnPush' : 'quiet', ply, tokens)} ${pick('opening', ply, tokens)}`
      intensity = 'buildup'
    } else {
      const sideAhead: Color | null = material >= 4 ? 'w' : material <= -4 ? 'b' : null
      if (sideAhead && dominantAnnounced !== sideAhead && quietStreak >= 2) {
        dominantAnnounced = sideAhead
        text = pick('dominant', ply, { ...tokens, p: names[sideAhead], o: names[sideAhead === 'w' ? 'b' : 'w'] })
        intensity = 'buildup'
      } else {
        text = pick(move.piece === 'p' && !move.captured ? 'pawnPush' : 'quiet', ply, tokens)
        showInFeed = quietStreak % 3 === 0
      }
    }

    quietStreak = intensity === 'calm' ? quietStreak + 1 : 0

    frames.push({
      ply,
      san: move.san,
      color: move.color,
      fen: chess.fen(),
      lastMove: { from: move.from, to: move.to },
      minute: formatMinute(ply, total),
      text,
      tag,
      intensity,
      score: { ...score },
      material,
      showInFeed,
    })
  }

  frames.push(fullTimeFrame(game, chess, frames[frames.length - 1], seed))
  return { frames, totalPlies: total }
}

function fullTimeFrame(game: NormalizedGame, chess: Chess, last: Frame, seed: number): Frame {
  const winner = game.result === '1-0' ? game.white.name : game.result === '0-1' ? game.black.name : ''
  const loser = game.result === '1-0' ? game.black.name : game.result === '0-1' ? game.white.name : ''
  const term = (game.termination ?? '').toLowerCase()

  let key = 'unknown'
  if (game.result === '*') key = 'unfinished'
  else if (chess.isCheckmate() || term.includes('checkmate')) key = 'checkmate'
  else if (chess.isStalemate() || term.includes('stalemate')) key = 'stalemate'
  else if (term.includes('repetition') || chess.isThreefoldRepetition()) key = 'repetition'
  else if (term.includes('insufficient') || chess.isInsufficientMaterial()) key = 'insufficient'
  else if (game.result === '1/2-1/2') key = 'draw'
  else if (term.includes('resign')) key = 'resign'
  else if (term.includes('time')) key = 'time'
  else if (term.includes('abandon')) key = 'abandon'

  const pool = FULL_TIME[key]
  let text = fill(pool[seed % pool.length], { w: winner, l: loser })

  const { white, black } = last.score
  const goalWinner = white > black ? 'w' : black > white ? 'b' : null
  const resultWinner = game.result === '1-0' ? 'w' : game.result === '0-1' ? 'b' : null
  if (goalWinner && resultWinner && goalWinner !== resultWinner) {
    text += ` ${loser} won more pieces but lost the match — football can be cruel.`
  }

  return {
    ...last,
    ply: last.ply + 1,
    san: undefined,
    minute: 'FT',
    text,
    tag: 'FULL TIME',
    intensity: key === 'unfinished' ? 'buildup' : 'goal',
    showInFeed: true,
  }
}
