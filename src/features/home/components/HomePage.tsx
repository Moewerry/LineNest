import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useEditor } from '@/features/editor/model/store'
import { HomeHeader } from './HomeHeader'
import { EditorPreview } from './EditorPreview'

export function HomePage() {
  const hasDocument = useEditor(s => !!s.present.doc.image)
  return <div className="flex h-dvh flex-col overflow-hidden bg-background">
    <HomeHeader />
    <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-6 pb-[clamp(8px,2dvh,20px)] md:px-10">
      <section className="flex shrink-0 items-end justify-between gap-6 pb-[clamp(12px,3dvh,28px)] pt-[clamp(8px,2.5dvh,24px)]">
        <div><h1 className="text-[clamp(24px,4.8dvh,44px)] font-medium leading-tight tracking-tight">画好线，再分图。</h1><p className="mt-[clamp(6px,1.5dvh,14px)] text-sm leading-6 text-muted-foreground">选中几条线，编成一组，复制到需要的位置。</p></div>
        <div className="shrink-0 space-y-2"><Button asChild size="lg" className="w-full gap-8 rounded-lg px-6"><Link to="/editor">{hasDocument ? '继续编辑' : '开始编辑'}<ArrowRight className="size-4" /></Link></Button><p className="text-center text-[11px] text-muted-foreground">图片只在浏览器本地处理</p></div>
      </section>
      <EditorPreview />
      <footer className="flex shrink-0 items-center justify-between gap-4 px-1 pt-[clamp(8px,2dvh,18px)] text-[11px] text-muted-foreground"><span>手动画线<span className="mx-3 text-border">/</span>整组复制<span className="mx-3 text-border">/</span>本地模板</span><span>LineNest</span></footer>
    </main>
  </div>
}
