import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShortcutKeys } from '@/features/editor/components/ShortcutKeys'
import type { TemplatePlacement } from './placement'

export function TemplatePlacementStatus({ placement, temporaryView, dragging = false, onCancel }: { placement: TemplatePlacement; temporaryView: boolean; dragging?: boolean; onCancel: () => void }) {
  return <div id="template-placement-status" className="pointer-events-auto max-w-full rounded-xl border bg-card px-3 py-2.5">
    <div className="flex items-center gap-3">
      <p role="status" className="min-w-0 flex-1 truncate text-xs font-medium">{temporaryView ? '临时调整图片视图' : `待放置：${placement.name}`}</p>
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{Math.round(placement.bounds.width * placement.scale)} × {Math.round(placement.bounds.height * placement.scale)}</span>
      <Button variant="ghost" size="icon-xs" aria-label="取消模板放置" title="取消放置（Esc）" onClick={onCancel}><X /></Button>
    </div>
    <p className="mt-2 text-[11px] leading-6 text-muted-foreground">{dragging ? '松开鼠标放置，在画布外松开或按 Esc 取消' : temporaryView ? '拖动平移，滚轮缩放图片，松开空格继续放置' : <>移动定位，滚轮缩放，单击放置<br />按住 <ShortcutKeys keys={['空格']} /> 调整图片视图，Esc 取消</>}</p>
  </div>
}
