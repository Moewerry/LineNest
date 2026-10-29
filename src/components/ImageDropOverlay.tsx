import { Upload } from 'lucide-react'

export function ImageDropOverlay() {
  return <div data-slot="image-drop-overlay" className="pointer-events-none fixed inset-0 z-50 flex h-dvh flex-col overflow-y-auto border-4 border-dashed border-primary bg-white/95 pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top))]">
    <div role="status" className="mx-auto my-auto flex w-full min-w-0 shrink-0 flex-col items-center gap-4 text-center text-primary">
      <Upload aria-hidden="true" className="size-12" />
      <p className="text-xl font-semibold sm:text-2xl">松开图片，开始分图</p>
      <p className="text-sm text-muted-foreground">支持 PNG、JPG、WebP、AVIF</p>
    </div>
  </div>
}
