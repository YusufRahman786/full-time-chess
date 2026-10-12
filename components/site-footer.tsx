export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <p>
          <span className="font-display font-bold uppercase tracking-wide text-foreground">Full-Time Chess</span> — a
          fun project. Not affiliated with Chess.com, Lichess, or any football league.
        </p>
        <p>Game data from the public Chess.com and Lichess APIs.</p>
      </div>
    </footer>
  )
}
