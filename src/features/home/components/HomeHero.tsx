import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useEditor } from '@/features/editor/model/store'

export function HomeHero() {
  const hasDocument = useEditor(s => !!s.present.doc.image)
  return <section className="flex min-h-0 flex-col justify-center gap-[clamp(12px,2.8dvh,28px)] py-2">
    <p className="flex items-center gap-2 text-xs font-medium"><span aria-hidden="true" className="h-0.5 w-5 bg-primary" />图片分割工具</p>
    <h1 className="text-[clamp(32px,8.2dvh,80px)] font-semibold leading-[1.1] tracking-[-0.055em]">
      <span className="block">画线。</span>
      <span className="block">复制。</span>
      <span className="mt-1 inline-block bg-highlight px-2 pb-1 text-primary">分图。</span>
    </h1>
    <p className="max-w-64 text-sm leading-7 text-muted-foreground">手动画线，整组复制。<br />按线切图，一次导出。</p>
    <div className="max-w-64 space-y-3">
      <Button asChild size="lg" className="h-[clamp(42px,7dvh,56px)] w-full justify-between rounded-xl px-5 text-base"><Link to="/editor">{hasDocument ? '继续编辑' : '开始编辑'}<ArrowUpRight className="size-5" /></Link></Button>
      <p className="text-[11px] text-muted-foreground">图片只在浏览器本地处理</p>
    </div>
  </section>
}
