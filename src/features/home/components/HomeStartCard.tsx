import { Scissors, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HomeAnimatedText } from './HomeAnimatedText'
import { useHomeImageImport } from './HomeImageImport'
import { useHomeBatchEntry } from './HomeBatchEntry'

export function HomeStartCard() {
  const { busy, pickImage } = useHomeImageImport()
  const { openBatch, checking } = useHomeBatchEntry()

  return <div className="relative mx-auto w-full max-w-[480px] lg:mr-0">
    <div aria-hidden="true" className="home-card-back absolute -inset-3 -rotate-4 rounded-[30px] bg-primary/15 sm:-inset-5" />
    <section aria-label="开始图片分割" className="home-card-front relative rounded-3xl border border-white/10 bg-foreground p-7 text-background shadow-[0_16px_48px_-24px_rgba(40,35,30,0.4)] sm:p-10">
      <div className="flex items-center justify-between">
        <span className="home-card-label rounded-full border border-background/25 px-3 py-1.5 text-[10px] tracking-[0.15em]"><HomeAnimatedText delay={120} stagger={22}>YOUR NEXT CREATION</HomeAnimatedText></span>
        <span aria-hidden="true" className="home-card-dot size-2 shrink-0 rounded-full bg-highlight" />
      </div>
      <div className="mb-8 mt-10 flex items-center gap-5 sm:gap-6">
        <div className="home-card-icon flex size-20 shrink-0 -rotate-6 items-center justify-center rounded-[22px] bg-primary text-primary-foreground"><Scissors aria-hidden="true" className="size-10" strokeWidth={1.4} /></div>
        <p className="text-2xl font-semibold leading-snug tracking-[0.08em]"><HomeAnimatedText delay={100} stagger={40}>画一次，</HomeAnimatedText><br /><HomeAnimatedText delay={240} stagger={40}>整组复用。</HomeAnimatedText></p>
      </div>
      <p className="mb-8 text-sm leading-7 tracking-[0.06em] text-background/70"><HomeAnimatedText delay={380}>从画线到分图，简单顺手</HomeAnimatedText></p>
      <Button size="lg" disabled={busy} onClick={pickImage} className="home-card-action group h-14 w-full justify-center gap-2 rounded-xl px-5 text-center text-base tracking-[0.1em] shadow-none hover:bg-primary/90"><HomeAnimatedText stagger={35}>上传图片</HomeAnimatedText><Upload aria-hidden="true" className="size-5 transition-transform motion-reduce:transition-none motion-safe:group-hover:-translate-y-0.5" /></Button>
      <Button disabled={busy || checking} onClick={openBatch} variant="ghost" className="mt-4 h-12 w-full rounded-xl border border-background/10 bg-background/5 text-background hover:bg-background/10 hover:text-background"><Scissors aria-hidden="true" />{checking ? '正在读取…' : '批量裁剪图片'}</Button>
    </section>
  </div>
}
