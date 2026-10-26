import { ArrowUpRight, ImagePlus, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CanvasEmptyState({ onPick, busy }: { onPick: () => void; busy: boolean }) {
  return <div className="absolute inset-0 flex items-center justify-center p-8">
    <section className="flex w-full max-w-md flex-col items-center rounded-3xl border bg-card px-8 py-12 text-center shadow-sm">
      <span className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-accent text-primary"><ImagePlus aria-hidden="true" className="size-6" strokeWidth={1.5} /></span>
      <h1 className="text-xl font-semibold tracking-tight">从一张图片开始</h1>
      <p className="mb-7 mt-3 text-sm leading-7 text-muted-foreground">将图片拖到这里，<br />或选择文件，创建你的分割布局。</p>
      <Button size="lg" className="rounded-full px-6" onClick={onPick} disabled={busy}>{busy ? '正在读取图片' : '选择图片'}<ArrowUpRight className="size-4" /></Button>
      <p className="mt-4 text-[11px] text-muted-foreground">支持 PNG、JPG、WebP、AVIF</p>
      <p className="mt-8 flex items-center gap-1.5 text-[11px] text-muted-foreground"><LockKeyhole aria-hidden="true" className="size-3" />图片仅在本地处理</p>
    </section>
  </div>
}
