import { Asterisk } from 'lucide-react'
import { HomeStartCard } from './HomeStartCard'

export function HomeHero() {
  return <section className="grid flex-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.45fr_1fr] lg:gap-16 lg:py-20">
    <div className="home-enter">
      <p className="mb-7 flex items-center gap-3 text-[11px] font-semibold tracking-[0.16em]"><span className="h-2 w-2 bg-primary" aria-hidden="true" />小工具，大有用处<span className="ml-2 font-normal tracking-normal text-muted-foreground">IMAGE SLICING STUDIO</span></p>
      <h1 className="text-[clamp(48px,6.8vw,92px)] font-black leading-[1.13] tracking-[-0.065em]">
        <span className="block">好素材，</span>
        <span className="mt-2 block text-primary">分得漂亮<span className="text-foreground">。</span></span>
      </h1>
      <div className="mt-8 flex items-start gap-4 sm:mt-10">
        <Asterisk aria-hidden="true" className="mt-1 size-7 shrink-0 text-primary" strokeWidth={1.5} />
        <p className="max-w-sm text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">LineNest — 让创作更顺手<br /><span className="text-[11px] tracking-[0.12em]">MADE FOR YOUR FLOW</span></p>
      </div>
    </div>
    <HomeStartCard />
  </section>
}
