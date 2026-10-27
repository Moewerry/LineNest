import { LoaderCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function LoadingOverlay({ open = true, title = '正在打开工作台', description = '请稍候，正在准备画布。' }: { open?: boolean; title?: string; description?: string }) {
  return <Dialog open={open}>
    <DialogContent showCloseButton={false} className="sm:max-w-xs" onEscapeKeyDown={event => event.preventDefault()} onPointerDownOutside={event => event.preventDefault()} onInteractOutside={event => event.preventDefault()}>
      <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col items-center gap-4 py-3">
        <LoaderCircle aria-hidden="true" className="size-8 animate-spin text-primary motion-reduce:animate-none" />
        <DialogHeader className="items-center text-center sm:text-center">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </div>
    </DialogContent>
  </Dialog>
}
