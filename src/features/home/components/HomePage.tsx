import { HomeHeader } from './HomeHeader'
import { HomeHero } from './HomeHero'
import { HomeWorkflow } from './HomeWorkflow'

export function HomePage() {
  return <div className="home-page flex min-h-dvh flex-col overflow-clip bg-background">
    <HomeHeader />
    <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-6 sm:px-10 lg:px-14">
      <HomeHero />
      <HomeWorkflow />
    </main>
  </div>
}
