import { ArrowUpRight, LockKeyhole, Scissors } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useEditor } from '@/features/editor/model/store'
import { HomeAnimatedText } from './HomeAnimatedText'

export function HomeStartCard() {
  const hasDocument = useEditor(s => !!s.present.doc.image)

  return <div className="relative mx-auto w-full max-w-[420px] lg:mr-0">
    <div aria-hidden="true" className="home-card-back absolute -inset-3 rotate-3 rounded-[28px] bg-primary/15 sm:-inset-4" />
    <section aria-label="开始图片分割" className="home-card-front relative rounded-3xl bg-foreground p-7 text-background sm:p-9">
      <div className="flex items-center justify-between">
        <span className="home-card-label rounded-full border border-background/25 px-3 py-1.5 text-[10px] tracking-[0.15em]"><HomeAnimatedText delay={120} stagger={22}>YOUR NEXT CREATION</HomeAnimatedText></span>
        <span aria-hidden="true" className="home-card-dot size-2 shrink-0 rounded-full bg-highlight" />
      </div>
      <div className="mb-8 mt-10 flex items-center gap-5">
        <div className="home-card-icon flex size-20 shrink-0 -rotate-6 items-center justify-center rounded-[22px] bg-primary text-primary-foreground"><Scissors aria-hidden="true" className="size-10" strokeWidth={1.4} /></div>
        <p className="text-2xl font-semibold leading-snug tracking-tight"><HomeAnimatedText delay={100} stagger={40}>画一次，</HomeAnimatedText><br /><HomeAnimatedText delay={240} stagger={40}>整组复用。</HomeAnimatedText></p>
      </div>
      <p className="mb-7 text-sm leading-7 text-background/60"><HomeAnimatedText delay={380}>从画线到分图，简单顺手</HomeAnimatedText></p>
      <Button asChild size="lg" className="home-card-action group h-14 w-full justify-between rounded-xl px-5 text-base shadow-none hover:bg-primary/90"><Link to="/editor">{hasDocument ? '继续编辑' : '开始分图'}<ArrowUpRight className="size-5 transition-transform motion-reduce:transition-none motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" /></Link></Button>
      <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-background/55"><LockKeyhole aria-hidden="true" className="home-card-privacy-icon size-3 shrink-0" /><HomeAnimatedText delay={640} stagger={24}>图片留在本地，隐私更安心</HomeAnimatedText></p>
    </section>
  </div>
}
