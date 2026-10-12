import { memo } from 'react'
import { cn } from '@/lib/utils'

const NAMES: Record<string, string> = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' }
const FILES = 'abcdefgh'

interface Props {
  fen: string
  orientation: 'w' | 'b'
  lastMove?: { from: string; to: string }
  flash?: boolean
}

function parseFen(fen: string): (string | null)[][] {
  return fen
    .split(' ')[0]
    .split('/')
    .map((row) => {
      const cells: (string | null)[] = []
      for (const ch of row) {
        if (/\d/.test(ch)) cells.push(...Array<null>(Number(ch)).fill(null))
        else cells.push(ch)
      }
      return cells
    })
}

export const ChessBoard = memo(function ChessBoard({ fen, orientation, lastMove, flash }: Props) {
  const board = parseFen(fen)
  const ranks = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]
  const files = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]

  return (
    <div
      role="img"
      aria-label={`Chess board, ${orientation === 'w' ? 'white' : 'black'} at the bottom${
        lastMove ? `. Last move ${lastMove.from} to ${lastMove.to}` : ''
      }`}
      className={cn(
        'grid aspect-square w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-md border-4 border-secondary select-none',
        flash && 'animate-goal-flash',
      )}
    >
      {ranks.map((r) =>
        files.map((f) => {
          const square = `${FILES[f]}${8 - r}`
          const piece = board[r]?.[f] ?? null
          const isLight = (r + f) % 2 === 0
          const highlighted = lastMove && (lastMove.from === square || lastMove.to === square)
          const showFile = r === ranks[7]
          const showRank = f === files[0]

          return (
            <div
              key={square}
              aria-hidden="true"
              className={cn(
                'relative flex items-center justify-center',
                isLight ? 'bg-board-light' : 'bg-board-dark',
              )}
            >
              {highlighted && <span className="absolute inset-0 bg-highlight/55" />}
              {showRank && (
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 text-[0.55rem] font-bold leading-none sm:text-[0.65rem]',
                    isLight ? 'text-board-dark' : 'text-board-light',
                  )}
                >
                  {8 - r}
                </span>
              )}
              {showFile && (
                <span
                  className={cn(
                    'absolute bottom-0.5 right-1 text-[0.55rem] font-bold leading-none sm:text-[0.65rem]',
                    isLight ? 'text-board-dark' : 'text-board-light',
                  )}
                >
                  {FILES[f]}
                </span>
              )}
              {piece && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/pieces/${piece === piece.toUpperCase() ? 'w' : 'b'}${piece.toUpperCase()}.svg`}
                  alt=""
                  title={`${piece === piece.toUpperCase() ? 'White' : 'Black'} ${NAMES[piece.toLowerCase()]}`}
                  draggable={false}
                  className="relative size-[88%]"
                />
              )}
            </div>
          )
        }),
      )}
    </div>
  )
})
