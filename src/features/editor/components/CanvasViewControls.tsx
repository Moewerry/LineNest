import { LoaderCircle, Maximize, Minus, Plus, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CanvasGuideControls, type CanvasGuides } from './CanvasGuideControls'

type Props = {
  scale: number
  busy: boolean
  rotating: boolean
  guides: CanvasGuides
  onGuidesChange: (guides: CanvasGuides) => void
  onZoom: (factor: number) => void
  onFit: () => void
  onRotate: () => void
}

export function CanvasViewControls({ scale, busy, rotating, guides, onGuidesChange, onZoom, onFit, onRotate }: Props) {
  return <div role="group" aria-label="画布视图工具" aria-busy={rotating} className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full border border-[var(--workspace-divider)] bg-card p-1.5 shadow-sm">
    <Button variant="ghost" size="icon-sm" aria-label="缩小" title="缩小" disabled={busy} onClick={() => onZoom(1 / 1.2)}><Minus /></Button>
    <span className="w-12 text-center text-xs tabular-nums">{Math.round(scale * 100)}%</span>
    <Button variant="ghost" size="icon-sm" aria-label="放大" title="放大" disabled={busy} onClick={() => onZoom(1.2)}><Plus /></Button>
    <span aria-hidden="true" className="mx-1 h-4 border-l border-[var(--workspace-divider)]" />
    <Button variant="ghost" size="icon-sm" aria-label="适应画布" title="适应画布" disabled={busy} onClick={onFit}><Maximize /></Button>
    <CanvasGuideControls guides={guides} busy={busy} onChange={onGuidesChange} />
    <span aria-hidden="true" className="mx-1 h-4 border-l border-[var(--workspace-divider)]" />
    <Button type="button" variant="ghost" size="icon-sm" aria-label={rotating ? '正在旋转图片' : '图片向右旋转 90°'} title="图片向右旋转 90°" disabled={busy} onClick={onRotate}>{rotating ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <RotateCw />}</Button>
  </div>
}
