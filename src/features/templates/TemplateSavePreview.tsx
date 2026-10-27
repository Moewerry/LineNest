import { TemplateThumbnail } from './TemplateThumbnail'
import type { LineTemplate } from './layout'

export function TemplateSavePreview({ layout, count, error }: { layout: LineTemplate | null; count: number; error: string | null }) {
  return <section aria-label="待保存模板预览" className="flex flex-col rounded-xl border bg-muted/30 p-5">
    <h3 className="text-sm font-medium">线条预览</h3>
    <div className="flex min-h-48 flex-1 items-center justify-center py-5">
      {layout ? <TemplateThumbnail layout={layout} className="h-48 w-full bg-transparent p-0" /> : <p role="status" className="text-center text-sm leading-6 text-muted-foreground">{error ?? '请选择要保存的线条'}</p>}
    </div>
    <div aria-live="polite" className="space-y-2 border-t pt-4">
      <p className="text-sm font-medium">{count} 条线条</p>
      <p className="text-xs leading-5 text-muted-foreground">保存线条及其位置，不包含原图和颜色标记。可在其他图片上套用，也可用于批量裁剪。</p>
    </div>
  </section>
}
