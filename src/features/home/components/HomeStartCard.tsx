import { ArrowRight, ImagePlus, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHomeImageImport } from './HomeImageImport'
import { useHomeBatchEntry } from './HomeBatchEntry'

export function HomeStartCard() {
  const { busy, pickImage } = useHomeImageImport()
  const { openBatch, checking } = useHomeBatchEntry()

  return <div className="mx-auto w-full max-w-[460px] lg:mr-0">
    <section aria-label="开始图片分割" className="rounded-3xl border bg-card p-6 shadow-[0_12px_50px_-30px_rgba(40,35,30,0.18)] sm:p-8">
      <div className="flex flex-col items-center rounded-2xl border border-dashed bg-background/60 px-5 py-9 text-center sm:py-12">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border bg-card text-primary"><ImagePlus aria-hidden="true" className="size-6" strokeWidth={1.5} /></div>
        <h2 className="text-xl font-semibold">从一张图片开始</h2>
        <p className="mb-6 mt-3 text-sm leading-6 text-muted-foreground">拖入图片，或点击下方选择文件</p>
        <Button size="lg" disabled={busy} onClick={pickImage} className="h-11 rounded-xl px-7 shadow-none">{busy ? '正在导入…' : '选择图片'}<ArrowRight aria-hidden="true" className="size-4" /></Button>
        <p className="mt-4 text-[11px] text-muted-foreground">PNG · JPG · WebP · AVIF</p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <div><p className="text-sm font-medium">处理一整组图片？</p><p className="mt-1 text-xs text-muted-foreground">使用已保存的线条模板</p></div>
        <Button disabled={busy || checking} onClick={openBatch} variant="ghost" className="h-10 rounded-lg text-xs"><Scissors aria-hidden="true" />{checking ? '读取中…' : '批量裁剪'}</Button>
      </div>
    </section>
  </div>
}
