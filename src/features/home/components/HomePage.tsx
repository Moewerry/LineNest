import { HomeHeader } from './HomeHeader'
import { HomeHero } from './HomeHero'
import { HomeWorkflow } from './HomeWorkflow'
import { HomeImageImport } from './HomeImageImport'
import { HomeFooter } from './HomeFooter'
import { HomeBatchEntry } from './HomeBatchEntry'

export function HomePage() {
  return <HomeImageImport>
    <HomeBatchEntry>
      <HomeHeader />
      <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-6 pb-12 sm:px-10">
        <HomeHero />
        <HomeWorkflow />
      </main>
      <HomeFooter />
    </HomeBatchEntry>
  </HomeImageImport>
}
