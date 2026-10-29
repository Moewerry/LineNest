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
      <main className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-[1320px] flex-1 flex-col px-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:px-10 sm:pb-6 lg:px-14 sm:[@media(max-height:900px)]:pb-[20px]">
        <HomeHero />
        <HomeWorkflow />
      </main>
      <HomeFooter />
    </HomeBatchEntry>
  </HomeImageImport>
}
