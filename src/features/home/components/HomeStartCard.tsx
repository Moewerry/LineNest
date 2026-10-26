import { LoaderCircle, Scissors, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HomeAnimatedText } from './HomeAnimatedText'
import { useHomeImageImport } from './HomeImageImport'

export function HomeStartCard() {
  const { busy, pickImage } = useHomeImageImport()

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
      <Button size="lg" disabled={busy} onClick={pickImage} className="home-card-action group relative h-14 w-full justify-center rounded-xl px-12 text-center text-base shadow-none hover:bg-primary/90">{busy ? '正在导入图片' : <HomeAnimatedText stagger={35}>上传图片</HomeAnimatedText>}{busy ? <LoaderCircle aria-hidden="true" className="absolute right-5 size-5 animate-spin motion-reduce:animate-none" /> : <Upload aria-hidden="true" className="absolute right-5 size-5 transition-transform motion-reduce:transition-none motion-safe:group-hover:-translate-y-0.5" />}</Button>
      <p className="mt-3 text-center text-xs text-background/60" role={busy ? 'status' : undefined}>{busy ? '正在读取，请稍候' : '也可直接拖入图片，自动进入工具台'}</p>
    </section>
  </div>
}
