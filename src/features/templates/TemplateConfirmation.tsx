import type { ImageInfo } from '@/features/editor/model/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { LineTemplate } from './layout'
import { sameSize } from './apply'

export type TemplateConfirmationState = { type: 'apply'; template: LineTemplate; currentImage: ImageInfo } | { type: 'delete'; id: string }

export function TemplateConfirmation({ confirmation, busy, disabled, onCancel, onConfirm }: {
  confirmation: TemplateConfirmationState | null
  busy: boolean
  disabled: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const deleting = confirmation?.type === 'delete'
  return <Dialog open={!!confirmation} onOpenChange={open => { if (!open && !busy) onCancel() }}>
    <DialogContent onInteractOutside={event => { if (busy) event.preventDefault() }} onEscapeKeyDown={event => { if (busy) event.preventDefault() }}>
      <DialogHeader>
        <DialogTitle>{deleting ? '删除这个模板？' : '套用线条到当前图片？'}</DialogTitle>
        <DialogDescription>{deleting ? '删除后无法从模板列表恢复，当前画布不受影响。' : '仅替换线条和分组，保留当前图片、裁剪选区和区域标记。套用后可以撤销。'}</DialogDescription>
      </DialogHeader>
      {confirmation?.type === 'apply' && !sameSize(confirmation.template, confirmation.currentImage) && <div className="space-y-2 rounded-lg border bg-secondary p-3 text-xs leading-6">
        <p>模板尺寸：{confirmation.template.width} × {confirmation.template.height}<br />当前图片：{confirmation.currentImage.width} × {confirmation.currentImage.height}</p>
        <p>尺寸不同。自由线条保留原坐标，不缩放，超出图片的部分会隐藏；分割线保持方向和分割坐标，延伸至当前图片两侧。</p>
      </div>}
      <DialogFooter>
        <Button variant="outline" disabled={busy} onClick={onCancel}>取消</Button>
        <Button variant={deleting ? 'destructive' : 'default'} disabled={busy || disabled} onClick={onConfirm}>{busy ? '正在处理' : deleting ? '删除' : '套用线条'}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
