// Tokens: {p} mover, {o} opponent, {piece} moved piece, {cap} captured piece, {sq} target square, {san} move
export const LINES = {
  kickoff: [
    "And we're under way! {p} gets us started with {san}. The atmosphere here is ELECTRIC.",
    "The referee blows the whistle and {p} opens with {san}. Ninety minutes of pure chess football await.",
    "KICK-OFF! {p} plays {san} and the travelling fans are already in full voice.",
  ],
  reply: [
    "{p} answers with {san}. No nerves on show — this one's been in the training ground for weeks.",
    "And {p} responds with {san}. A measured reply. The managers are scribbling notes.",
    "{san} from {p}. Calm, composed, textbook stuff in the opening exchanges.",
  ],
  opening: [
    "We're into the {opening}, folks. The pundits in the studio are nodding approvingly.",
    "It's the {opening}! Both sides came here with a game plan and they are sticking to it.",
    "The {opening} it is — a classic of the genre, like a 4-4-2 on a wet Tuesday night.",
  ],
  quiet: [
    "{p} keeps it tidy with {san}. Patient build-up play.",
    "{san} from {p}. Recycling possession, probing for an opening.",
    "{p} shuffles with {san}. Not one for the highlight reel, but the gaffer will like it.",
    "Neat little {piece} move from {p} — {san}. Keeping the shape.",
    "{san}. {p} is happy to sit deep and let {o} come at them.",
    "{p} switches play with {san}. Looking for space out wide.",
    "Probing from {p}. {san}, and {o} has to think about this one.",
    "{p} brings the {piece} into the game with {san}. Building, building...",
  ],
  pawnPush: [
    "{p} pushes forward with {san}. The full-back is bombing on!",
    "{san} — {p} gains a bit of territory. Pressing high up the pitch.",
    "Pawn up the field from {p}. {san}. Tidy.",
  ],
  castleKing: [
    "{p} castles kingside! Parking the bus in front of the king. Sensible defending.",
    "There's the castle from {p} — king tucked away safely. The keeper is OFF HIS LINE no more.",
  ],
  castleQueen: [
    "{p} castles QUEENSIDE! Bold, aggressive, and the crowd absolutely love it!",
    "Long castle from {p}! That's a statement — the rook is straight into the action.",
  ],
  capturePawn: [
    "{p} nicks a pawn with {san}. A tidy interception in midfield.",
    "{san} — {p} wins the ball back. Just a pawn, but every little helps.",
    "Pawn snaffled by {p}. {san}. {o} will want that one back.",
  ],
  captureMinor: [
    "GOAL! {p} takes the {cap} on {sq}! {san}! What a finish!",
    "{p} PICKS OFF THE {CAP}! {san} — and the net is bulging!",
    "IN! {p} wins the {cap} with {san}! That's a proper striker's goal!",
  ],
  captureRook: [
    "GOAL!! {p} takes the ROOK! {san}! The away end is going absolutely BERSERK!",
    "THE ROOK IS GONE! {p} with {san} — a thunderbolt into the top corner!",
  ],
  captureQueen: [
    "THE QUEEN IS DOWN! THE QUEEN IS DOWN! {p} WITH {san} — THIS IS ABSOLUTE CARNAGE!",
    "UNBELIEVABLE! {p} HAS TAKEN THE QUEEN! {san}! YOU CANNOT WRITE SCRIPTS LIKE THIS!",
  ],
  recapture: [
    "And {p} hits straight back! {san} — the equaliser! What a response!",
    "{p} responds immediately with {san}! They're level again and the noise is DEAFENING!",
  ],
  queenTrade: [
    "And the queens are off! Both managers have taken off their star strikers. It's a different game now.",
  ],
  sacrifice: [
    "HE'S SACRIFICED THE {PIECE}! THE CROWD IS ON ITS FEET! THIS COULD CHANGE EVERYTHING!",
    "WHAT IS {p} DOING?! THE {PIECE} IS JUST LEFT THERE! {san}! IS THIS GENIUS OR MADNESS?!",
    "{p} THROWS THE {PIECE} INTO THE FIRE! {san}! ALL-OUT ATTACK — THEY'VE BROUGHT THE KEEPER UP!",
  ],
  blunder: [
    "Oh dear. Oh dear, oh dear. {p} has left the {piece} hanging with {san}. That's a HOWLER.",
    "{san}?! {p} has given the {piece} away! The manager has his head in his hands on the touchline.",
    "A catastrophic back-pass from {p} — {san}, and the {piece} is there for the taking!",
  ],
  gamble: [
    "{p} leaves the {piece} en prise with {san}! A massive gamble — will it pay off?",
  ],
  baitTaken: [
    "{p} takes the bait! {san}! But is there a sting in the tail?",
    "And {p} gobbles it up — {san}. Brave or foolish? We'll find out in a moment.",
  ],
  baitDeclined: [
    "{p} declines the offer with {san}. Doesn't fancy it. Smells a trap.",
  ],
  check: [
    "CHECK! {p} with {san}! The king is under siege!",
    "{san} — CHECK! {p} is peppering the box!",
    "{p} with a shot on target! {san}, CHECK! {o} has to deal with this!",
    "Check from {p}! {san}! The defence is at sixes and sevens!",
  ],
  promotion: [
    "THE PAWN HAS PROMOTED! {p} gets a brand new {piece}! It's like signing a superstar on deadline day!",
    "PROMOTION! {san}! The academy graduate becomes a {piece}! What a story!",
  ],
  enPassant: [
    "EN PASSANT! {p} with {san}! The most obscure rule in the book and they've used it! The VAR is checking... it STANDS!",
  ],
  dominant: [
    "{p} is running riot here. {o} needs a tactical reshuffle at half time — and fast.",
    "This is one-way traffic now. {p} is all over {o}.",
  ],
  checkmate: [
    "CHECKMATE!!! {p} WINS IT WITH {san}! IT'S ALL OVER! SCENES! ABSOLUTE SCENES!",
    "{san} — IT'S CHECKMATE! {p} HAS DONE IT! THEY'LL BE TALKING ABOUT THIS ONE FOR YEARS!",
  ],
  stalemate: [
    "Stalemate! {o} has nowhere to go but isn't in check — it's a DRAW! {p} cannot believe it!",
  ],
} as const

export type LineKey = keyof typeof LINES

export const FULL_TIME: Record<string, string[]> = {
  checkmate: ['FULL TIME! {w} wins by checkmate. A performance for the ages.'],
  resign: [
    "{l} throws in the towel! It's over — {w} takes all three points.",
    "{l} has seen enough and shakes hands. Full time, and {w} is the winner!",
  ],
  time: ["The clock has run out on {l}! The referee blows the final whistle — {w} wins on time!"],
  abandon: ['{l} has walked off the pitch! {w} takes the points by forfeit.'],
  stalemate: ["Stalemate! The points are shared — nobody knows quite how to feel about it."],
  draw: ["Full time, and the spoils are shared. A hard-fought draw that neither side will hate."],
  insufficient: ['Not enough firepower left on the pitch — the referee calls it a draw.'],
  repetition: ['Round and round they go... threefold repetition! The points are shared.'],
  unfinished: ["The game's still going, folks! We'll bring you the result as soon as we have it."],
  unknown: ['FULL TIME! {w} gets the win. What a contest.'],
}
