import { segments } from '@/features/editor/geometry'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { batchDocument } from './document'
import { BatchPreviewOverlay } from './BatchPreviewOverlay'
import type { BatchFit, BatchItem, BatchTemplate } from './types'

export function BatchPreview({ item, templates, fit, disabled, running, status, total, onDownload, onOffset }: {
  item: BatchItem; templates: BatchTemplate[]; fit: BatchFit; disabled: boolean
  running: boolean; status: string; total?: number; onDownload: () => void
  onOffset: (id: string, axis: 'offsetX' | 'offsetY', value: number) => void
}) {
  const lines = segments(batchDocument(item, templates, fit))
  return <section className="min-w-0 space-y-4" aria-label="裁剪预览">
    <div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold">预览</h2><span className="truncate text-xs text-muted-foreground">{templates.length > 1 ? `${templates.length} 个模板 · 线条叠加` : templates[0]?.name ?? '请选择模板'}</span></div>
    <div aria-busy={running} className="canvas-surface relative isolate flex min-h-56 items-center justify-center overflow-hidden rounded-xl border p-3">
      <svg viewBox={`0 0 ${item.width} ${item.height}`} className="max-h-[50vh] w-full" style={{ aspectRatio: `${item.width} / ${item.height}` }} role="img" aria-label={`${item.file.name} 的裁剪线预览`}>
        <image href={item.url} width={item.width} height={item.height} />
        {lines.map(line => <line key={line.id} x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke="var(--primary)" strokeWidth={2} vectorEffect="non-scaling-stroke" />)}
      </svg>
      <BatchPreviewOverlay running={running} status={status} total={total} onDownload={onDownload} />
    </div>
    {templates.length > 0 && <div className="flex flex-wrap items-end gap-3">
      <label className="space-y-1 text-xs">左右移动（像素）<Input type="number" className="w-32" min={-16384} max={16384} step={1} disabled={disabled} value={item.offsetX} onChange={e => onOffset(item.id, 'offsetX', Number(e.target.value))} /></label>
      <label className="space-y-1 text-xs">上下移动（像素）<Input type="number" className="w-32" min={-16384} max={16384} step={1} disabled={disabled} value={item.offsetY} onChange={e => onOffset(item.id, 'offsetY', Number(e.target.value))} /></label>
      <Button size="sm" variant="ghost" disabled={disabled || (!item.offsetX && !item.offsetY)} onClick={() => { onOffset(item.id, 'offsetX', 0); onOffset(item.id, 'offsetY', 0) }}>重置位置</Button>
    </div>}
    {templates.length > 0 && <p className="text-xs text-muted-foreground">仅调整这张图片，所选模板一起移动。</p>}
    {item.error && <p role="alert" className="break-words text-sm text-destructive">{item.error}</p>}
  </section>
}
