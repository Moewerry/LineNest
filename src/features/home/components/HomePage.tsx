import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useEditor } from '@/features/editor/model/store'
import { HomeHeader } from './HomeHeader'
import { EditorPreview } from './EditorPreview'

export function HomePage() {
  const hasDocument = useEditor(s => !!s.present.doc.image)
  return <div className="min-h-dvh bg-background">
    <HomeHeader />
    <main className="mx-auto max-w-6xl px-6 pb-10 md:px-10">
      <section className="flex flex-col justify-between gap-7 pb-10 pt-10 md:flex-row md:items-end md:pb-12 md:pt-14">
        <div><p className="mb-4 text-xs text-muted-foreground">图片分割</p><h1 className="text-4xl font-medium leading-tight tracking-tight md:text-5xl">画好线，再分图。</h1><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">选中几条线，编成一组，复制到需要的位置。</p></div>
        <div className="shrink-0 space-y-3"><Button asChild size="lg" className="w-full gap-8 rounded-lg px-6"><Link to="/editor">{hasDocument ? '继续编辑' : '开始编辑'}<ArrowRight className="size-4" /></Link></Button><p className="text-center text-[11px] text-muted-foreground">图片只在浏览器本地处理</p></div>
      </section>
      <EditorPreview />
      <footer className="flex flex-wrap items-center justify-between gap-4 px-1 pt-6 text-[11px] text-muted-foreground"><span>手动画线<span className="mx-3 text-border">/</span>整组复制<span className="mx-3 text-border">/</span>本地模板</span><span>LineNest</span></footer>
    </main>
  </div>
}
