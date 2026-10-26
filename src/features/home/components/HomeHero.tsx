import { Asterisk } from 'lucide-react'
import { HomeStartCard } from './HomeStartCard'

export function HomeHero() {
  return <section className="grid flex-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.45fr_1fr] lg:gap-16 lg:py-20">
    <div>
      <h1 className="text-[clamp(48px,6.8vw,92px)] font-black leading-[1.13] tracking-[-0.065em]">
        <span className="home-title-mask block"><span className="home-title-line block">好素材，</span></span>
        <span className="home-title-mask mt-2 block text-primary"><span className="home-title-line home-title-line-delayed block">分得漂亮<span className="text-foreground">。</span></span></span>
      </h1>
      <div className="home-hero-description mt-8 flex items-start gap-4 sm:mt-10">
        <Asterisk aria-hidden="true" className="mt-1 size-7 shrink-0 text-primary" strokeWidth={1.5} />
        <p className="max-w-sm text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">LineNest — 让创作更顺手<br /><span className="text-[11px] tracking-[0.12em]">MADE FOR YOUR FLOW</span></p>
      </div>
    </div>
    <HomeStartCard />
  </section>
}
