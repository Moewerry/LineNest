import { ImagePlus, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CanvasEmptyState({ onPick, busy, dragging }: { onPick: () => void; busy: boolean; dragging: boolean }) {
  return <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/65 px-12 py-10 backdrop-blur-md">
    <section aria-labelledby="image-import-heading" aria-busy={busy} className="w-full max-w-3xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-12 lg:gap-24">
        <div>
          <h1 id="image-import-heading" className="text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-tight tracking-tight">从一张图片开始</h1>
          <p role="status" className="mt-6 text-base leading-8 text-muted-foreground">{busy ? '正在读取图片，请稍候…' : dragging ? '松开图片，开始分割。' : <>将图片拖拽到这里，<br />或选择文件。</>}</p>
        </div>
        <Button variant="ghost" aria-label="选择图片上传" disabled={busy} onClick={onPick} className="group h-auto min-h-48 w-44 flex-col gap-5 rounded-2xl p-5 text-foreground hover:bg-transparent hover:text-primary lg:w-52">
          {busy ? <LoaderCircle aria-hidden="true" className="size-24 animate-spin motion-reduce:animate-none" strokeWidth={1} /> : <ImagePlus aria-hidden="true" className="size-24 transition-transform motion-reduce:transition-none motion-safe:group-hover:-translate-y-1" strokeWidth={1} />}
          <span className="text-sm font-medium">{busy ? '正在读取图片' : '选择图片上传'}</span>
        </Button>
      </div>
      <p className="mt-12 text-xs text-muted-foreground">支持 PNG、JPG、WebP、AVIF</p>
    </section>
  </div>
}
