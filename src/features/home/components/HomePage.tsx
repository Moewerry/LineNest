import { HomeHeader } from './HomeHeader'
import { HomeHero } from './HomeHero'
import { HomeWorkflow } from './HomeWorkflow'
import { HomeImageImport } from './HomeImageImport'

export function HomePage() {
  return <HomeImageImport>
    <HomeHeader />
    <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-6 sm:px-10 lg:px-14">
      <HomeHero />
      <HomeWorkflow />
    </main>
  </HomeImageImport>
}
