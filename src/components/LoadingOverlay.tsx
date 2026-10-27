import { LoaderCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

export function LoadingOverlay({ open = true, title = '正在打开工作台', description = '请稍候，正在准备画布。' }: { open?: boolean; title?: string; description?: string }) {
  return <Dialog open={open}>
    <DialogContent showCloseButton={false} overlayClassName="bg-white/65 backdrop-blur-md" className="inset-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 items-center justify-center rounded-none border-0 bg-transparent px-6 py-24 shadow-none data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 sm:max-w-none sm:px-12" onEscapeKeyDown={event => event.preventDefault()} onPointerDownOutside={event => event.preventDefault()} onInteractOutside={event => event.preventDefault()}>
      <div role="status" aria-live="polite" aria-busy="true" className="grid w-full max-w-4xl gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-16 sm:gap-y-12 lg:gap-x-28 lg:gap-y-16">
        <DialogTitle className="min-w-0 text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-tight tracking-tight sm:col-start-1 sm:row-start-1">{title}</DialogTitle>
        <DialogDescription className="text-base leading-8 text-muted-foreground sm:col-start-2 sm:row-start-1 sm:text-right">{description}</DialogDescription>
        <LoaderCircle aria-hidden="true" className="size-8 animate-spin text-primary motion-reduce:animate-none sm:col-start-2 sm:row-start-2 sm:justify-self-end" />
      </div>
    </DialogContent>
  </Dialog>
}
