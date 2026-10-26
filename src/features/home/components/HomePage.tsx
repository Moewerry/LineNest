import { HomeHeader } from './HomeHeader'
import { EditorPreview } from './EditorPreview'
import { HomeHero } from './HomeHero'

export function HomePage() {
  return <div className="flex h-dvh flex-col overflow-hidden bg-background">
    <HomeHeader />
    <main className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col px-6 pb-[clamp(10px,2.5dvh,24px)] md:px-12">
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,0.8fr)_minmax(0,1.35fr)] gap-[clamp(20px,4vw,64px)] pb-[clamp(12px,3dvh,28px)] pt-2">
        <HomeHero />
        <EditorPreview />
      </div>
      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-foreground/15 pt-[clamp(8px,2dvh,16px)] text-[11px] text-muted-foreground"><span>Ctrl + G 编组<span className="mx-3">·</span>Ctrl + D 复制</span><span>PNG / ZIP 导出</span></footer>
    </main>
  </div>
}
