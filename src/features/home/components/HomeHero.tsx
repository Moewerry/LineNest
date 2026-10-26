import { Asterisk } from 'lucide-react'
import { HomeStartCard } from './HomeStartCard'
import { HomeAnimatedText } from './HomeAnimatedText'

export function HomeHero() {
  return <section className="grid flex-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.45fr_1fr] lg:gap-16 lg:py-20">
    <div>
      <h1 className="text-[clamp(48px,6.8vw,92px)] font-black leading-[1.13] tracking-[-0.065em]">
        <HomeAnimatedText className="block" stagger={65}>好素材，</HomeAnimatedText>
        <span className="mt-[0.08em] block text-primary"><HomeAnimatedText delay={260} stagger={65}>分得漂亮</HomeAnimatedText><HomeAnimatedText delay={520} className="text-foreground">。</HomeAnimatedText></span>
      </h1>
      <div className="mt-8 flex items-start gap-4 sm:mt-10">
        <Asterisk aria-hidden="true" className="home-hero-mark mt-1 size-7 shrink-0 text-primary" strokeWidth={1.5} />
        <p className="max-w-sm text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8"><HomeAnimatedText delay={200} stagger={24}>LineNest — 让创作更顺手</HomeAnimatedText><br /><HomeAnimatedText delay={420} stagger={18} className="text-[11px] tracking-[0.12em]">MADE FOR YOUR FLOW</HomeAnimatedText></p>
      </div>
    </div>
    <HomeStartCard />
  </section>
}
