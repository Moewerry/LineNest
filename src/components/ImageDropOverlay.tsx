import { Upload } from 'lucide-react'

export function ImageDropOverlay() {
  return <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center border-4 border-dashed border-primary bg-background/95">
    <div role="status" className="flex flex-col items-center gap-4 text-primary">
      <Upload aria-hidden="true" className="size-12" />
      <p className="text-2xl font-semibold">松开图片，开始分图</p>
      <p className="text-sm text-muted-foreground">支持 PNG、JPG、WebP、AVIF</p>
    </div>
  </div>
}
