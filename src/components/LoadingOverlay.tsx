import { LoaderCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

export function LoadingOverlay({ open = true, title = '正在打开工作台', description = '请稍候，正在准备画布。' }: { open?: boolean; title?: string; description?: string }) {
  return <Dialog open={open}>
    <DialogContent showCloseButton={false} overlayClassName="bg-white/65 backdrop-blur-md" className="inset-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col rounded-none border-0 bg-transparent pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-[calc(6rem+env(safe-area-inset-top))] shadow-none data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 sm:max-w-none sm:pb-[max(6rem,env(safe-area-inset-bottom))] sm:pl-[max(3rem,env(safe-area-inset-left))] sm:pr-[max(3rem,env(safe-area-inset-right))]" onEscapeKeyDown={event => event.preventDefault()} onPointerDownOutside={event => event.preventDefault()} onInteractOutside={event => event.preventDefault()}>
      <div role="status" aria-live="polite" aria-busy="true" className="mx-auto my-auto grid w-full max-w-4xl shrink-0 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-16 md:gap-y-12 lg:gap-x-28 lg:gap-y-16">
        <DialogTitle className="min-w-0 break-words text-[clamp(1.75rem,3.8vw,3.5rem)] font-semibold leading-tight tracking-tight md:col-start-1 md:row-start-1">{title}</DialogTitle>
        <DialogDescription className="min-w-0 break-words text-base leading-8 text-muted-foreground md:col-start-2 md:row-start-1 md:text-right">{description}</DialogDescription>
        <LoaderCircle aria-hidden="true" className="size-8 animate-spin text-primary motion-reduce:animate-none md:col-start-2 md:row-start-2 md:justify-self-end" />
      </div>
    </DialogContent>
  </Dialog>
}
