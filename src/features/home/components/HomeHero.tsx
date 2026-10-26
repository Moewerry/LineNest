import { Feather } from 'lucide-react'
import { HomeStartCard } from './HomeStartCard'

export function HomeHero() {
  return <section className="grid flex-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.45fr_1fr] lg:gap-16 lg:py-20">
    <div>
      <h1 className="text-[clamp(48px,6.8vw,92px)] font-black leading-[1.13] tracking-[0.02em]">
        <span className="home-hero-line home-hero-title-line block">好素材，</span>
        <span className="home-hero-line home-hero-title-line mt-[0.08em] block text-primary">分得漂亮<span className="text-foreground">。</span></span>
      </h1>
      <div className="mt-8 flex items-start gap-4 sm:mt-10">
        <Feather aria-hidden="true" className="home-hero-mark mt-1 size-10 shrink-0 rounded-xl bg-accent p-2 text-primary ring-1 ring-primary/15" strokeWidth={1.5} />
        <p className="max-w-sm text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8"><span className="home-hero-line home-hero-line-third block text-primary">LineNest — 让创作更顺手</span><span className="home-hero-line home-hero-line-fourth -mt-1 block text-[11px] leading-4 tracking-[0.12em] text-muted-foreground">Made for your flow</span></p>
      </div>
    </div>
    <HomeStartCard />
  </section>
}
