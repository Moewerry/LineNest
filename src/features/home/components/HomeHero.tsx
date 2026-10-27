import { ShieldCheck } from 'lucide-react'
import { HomeStartCard } from './HomeStartCard'

export function HomeHero() {
  return <section className="grid flex-1 shrink-0 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-24">
    <div className="max-w-lg">
      <p className="mb-6 font-brand text-xs tracking-[0.18em] text-muted-foreground">A LITTLE SPACE FOR YOUR CREATION</p>
      <h1 className="text-[clamp(40px,4.8vw,64px)] font-semibold leading-[1.25] tracking-tight">
        <span className="block">画一次，</span>
        <span className="mt-1 block">让好素材<span className="text-primary">各就各位。</span></span>
      </h1>
      <p className="mt-7 max-w-sm text-base leading-8 text-muted-foreground">画线分图、保存布局，再把同一组线条用到更多图片。给重复的工作，留一个简单的解法。</p>
      <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck aria-hidden="true" className="size-4" />图片在浏览器本地处理，无需上传原图</p>
    </div>
    <HomeStartCard />
  </section>
}
