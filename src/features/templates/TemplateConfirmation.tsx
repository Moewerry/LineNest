import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export type TemplateConfirmationState = { type: 'delete'; id: string }

export function TemplateConfirmation({ confirmation, busy, disabled, onCancel, onConfirm }: {
  confirmation: TemplateConfirmationState | null
  busy: boolean
  disabled: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return <Dialog open={!!confirmation} onOpenChange={open => { if (!open && !busy) onCancel() }}>
    <DialogContent onInteractOutside={event => { if (busy) event.preventDefault() }} onEscapeKeyDown={event => { if (busy) event.preventDefault() }}>
      <DialogHeader icon={<Trash2 />}>
        <DialogTitle>删除这个模板？</DialogTitle>
        <DialogDescription>删除后无法从模板列表恢复，当前画布不受影响。</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" disabled={busy} onClick={onCancel}>取消</Button>
        <Button variant="destructive" disabled={busy || disabled} onClick={onConfirm}>{busy ? '正在处理' : '删除'}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
