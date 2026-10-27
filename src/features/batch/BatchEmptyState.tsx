import { ArrowUpFromLine, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BatchEmptyState({ busy, importing, onAdd }: { busy: boolean; importing: boolean; onAdd: () => void }) {
  return <section className="flex min-h-80 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
    <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-secondary"><Images aria-hidden="true" className="size-7 text-muted-foreground" strokeWidth={1.5} /></span>
    <h2 className="text-xl font-semibold">把同一套布局，用到更多图片</h2>
    <p className="mb-7 mt-3 max-w-sm text-sm leading-7 text-muted-foreground">拖入一组图片，选择保存好的模板，即可统一裁剪。一次最多添加 100 张。</p>
    <Button size="lg" disabled={busy} onClick={onAdd} className="h-11 rounded-xl px-6"><ArrowUpFromLine />{importing ? '正在读取图片…' : '选择多张图片'}</Button>
    <p className="mt-4 text-xs text-muted-foreground">PNG · JPG · WebP · AVIF</p>
  </section>
}
