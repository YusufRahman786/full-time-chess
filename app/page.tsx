import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { MatchFinder } from '@/components/match-finder'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <MatchFinder />
      </main>
      <SiteFooter />
    </>
  )
}
