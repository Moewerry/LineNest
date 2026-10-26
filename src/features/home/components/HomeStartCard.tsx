import { ArrowUpRight, LockKeyhole, Scissors } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useEditor } from '@/features/editor/model/store'

export function HomeStartCard() {
  const hasDocument = useEditor(s => !!s.present.doc.image)

  return <div className="home-enter home-enter-delayed relative mx-auto w-full max-w-[420px] lg:mr-0">
    <div aria-hidden="true" className="absolute -inset-3 rotate-3 rounded-[28px] bg-primary/15 sm:-inset-4" />
    <section aria-label="开始图片分割" className="relative overflow-hidden rounded-3xl bg-foreground p-7 text-background sm:p-9">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-background/25 px-3 py-1.5 text-[10px] tracking-[0.15em]">YOUR NEXT CREATION</span>
        <span aria-hidden="true" className="size-2 rounded-full bg-highlight" />
      </div>
      <div className="mb-8 mt-10 flex items-center gap-5">
        <div className="flex size-20 shrink-0 -rotate-6 items-center justify-center rounded-[22px] bg-primary text-primary-foreground"><Scissors aria-hidden="true" className="size-10" strokeWidth={1.4} /></div>
        <p className="text-2xl font-semibold leading-snug tracking-tight">画一次，<br />整组复用。</p>
      </div>
      <p className="mb-7 text-sm leading-7 text-background/60">从画线到分图，简单顺手</p>
      <Button asChild size="lg" className="group h-14 w-full justify-between rounded-xl px-5 text-base shadow-none hover:bg-primary/90"><Link to="/editor">{hasDocument ? '继续编辑' : '开始分图'}<ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link></Button>
      <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-background/55"><LockKeyhole aria-hidden="true" className="size-3" />图片留在本地，隐私更安心</p>
    </section>
  </div>
}
