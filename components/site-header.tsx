export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="#top" className="flex items-center gap-2" aria-label="Full-Time Chess home">
          <span className="flex h-7 items-center rounded-sm bg-primary px-1.5 font-display text-sm font-black italic tracking-tight text-primary-foreground">
            FTC
          </span>
          <span className="font-display text-lg font-bold uppercase tracking-wide">Full-Time Chess</span>
        </a>
        <nav aria-label="Main" className="flex items-center gap-5 text-sm">
          <a href="#find" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline">
            Find a match
          </a>
          <span className="flex items-center gap-1.5 rounded-sm bg-destructive px-2 py-0.5 font-display text-xs font-bold uppercase tracking-widest text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
            Live
          </span>
        </nav>
      </div>
    </header>
  )
}
