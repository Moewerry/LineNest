import { Layers3 } from 'lucide-react'

export function Editor() {
  return (
    <main className="flex h-dvh min-w-[760px] flex-col overflow-hidden">
      <header className="flex h-16 shrink-0 items-center border-b bg-white px-5">
        <div className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="rounded-lg bg-primary p-2"><Layers3 className="size-5" /></span>
          <span className="text-lg">LineNest</span>
        </div>
        <span className="ml-6 border-l pl-6 text-xs text-muted-foreground">未命名</span>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav aria-label="编辑工具" className="w-16 shrink-0 border-r bg-white" />
        <section aria-label="编辑画布" className="canvas-surface flex flex-1 items-center justify-center">
          <span className="text-muted-foreground">导入图片</span>
        </section>
        <aside className="w-64 shrink-0 border-l bg-white p-5">
          <h2 className="text-xs font-medium">对象</h2>
          <p className="mt-6 text-xs text-muted-foreground">暂无线条</p>
        </aside>
      </div>
    </main>
  )
}
