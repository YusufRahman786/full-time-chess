import { ArrowDown } from 'lucide-react'

const TICKER = [
  'BREAKING: Local man castles queenside, crowd loses its mind',
  'VAR confirms en passant is, in fact, a real rule',
  'Bishop sacrifice on h7 described as "absolute cinema"',
  'Manager blames pawn structure for 0–4 defeat',
  'Knight on the rim officially "dim", say pundits',
  'Stalemate leaves both sets of fans deeply confused',
]

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden border-b border-border">
      <div className="pitch-lines absolute inset-0" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top,oklch(0.84_0.21_145/0.14),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 md:px-6 md:pb-24 md:pt-24">
        <div className="mb-8 inline-flex items-center gap-3 rounded-sm border border-border bg-card/70 px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="text-primary">Matchday</span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          Chess.com &amp; Lichess
        </div>

        <h1
          id="hero-heading"
          className="max-w-4xl text-balance font-display text-6xl font-black uppercase italic leading-[0.88] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
        >
          Every move. <span className="block">Every moment.</span>
          <span className="block text-primary">Every goal?</span>
        </h1>

        <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          Your chess games. Football commentary. Absolutely unnecessary levels of drama.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href="#find"
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-md bg-primary px-8 font-display text-xl font-extrabold uppercase italic tracking-wide text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
          >
            Find my match
            <ArrowDown className="size-5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
          <p className="text-sm text-muted-foreground">Public usernames only. We never ask for your password.</p>
        </div>
      </div>

      <div className="relative flex overflow-hidden border-t border-border bg-primary text-primary-foreground">
        <span className="z-10 shrink-0 bg-highlight px-4 py-2 font-display text-sm font-black uppercase italic tracking-widest text-highlight-foreground">
          Latest
        </span>
        <div className="flex w-max animate-ticker motion-reduce:animate-none" aria-hidden="true">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="whitespace-nowrap px-6 py-2 font-display text-sm font-bold uppercase tracking-wide">
              {item}
              <span className="ml-6 opacity-40">{'///'}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
