import { Crop, Image, MousePointer2, ScanLine } from 'lucide-react'
import type { Snapshot } from '../model/types'

export function CanvasDocumentStatus({ snapshot }: { snapshot: Snapshot }) {
  const { doc, selected } = snapshot
  if (!doc.image) return null

  return <div aria-label="画布信息" className="pointer-events-auto absolute bottom-16 left-7 right-2 flex items-center gap-3 overflow-x-auto rounded bg-card px-2 py-1 text-xs whitespace-nowrap tabular-nums text-[var(--workspace-muted-foreground)] sm:pointer-events-none sm:bottom-5 sm:left-10 sm:right-auto sm:max-w-[calc(100%-300px)] sm:flex-wrap sm:gap-y-1 sm:text-[11px]">
    <span className="inline-flex items-center gap-1"><Image aria-hidden="true" className="size-3 sm:hidden" /><span className="sr-only">图片尺寸</span>{doc.image.width} × {doc.image.height}<span className="hidden sm:inline">px</span></span>
    {doc.crop && <span className="inline-flex items-center gap-1"><Crop aria-hidden="true" className="size-3" /><span className="sr-only">裁剪尺寸</span>{Math.round(doc.crop.width)} × {Math.round(doc.crop.height)}</span>}
    {selected.length > 0 && <span className="inline-flex items-center gap-1"><MousePointer2 aria-hidden="true" className="size-3 sm:hidden" /><span className="sr-only sm:not-sr-only">已选</span>{selected.length}<span className="hidden sm:inline">项</span></span>}
    {!!doc.marks?.length && <span className="inline-flex items-center gap-1"><ScanLine aria-hidden="true" className="size-3 sm:hidden" /><span className="sr-only sm:not-sr-only">标记</span>{doc.marks.length}<span className="hidden sm:inline">块</span></span>}
  </div>
}
