import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

export function HomeNoTemplatesOverlay({ open, onOpenChange, onEnter }: { open: boolean; onOpenChange: (open: boolean) => void; onEnter: () => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} overlayClassName="bg-white/95 backdrop-blur-md" className="inset-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col rounded-none border-0 bg-transparent pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-[calc(6rem+env(safe-area-inset-top))] shadow-none data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 sm:max-w-none sm:pb-[max(6rem,env(safe-area-inset-bottom))] sm:pl-[max(3rem,env(safe-area-inset-left))] sm:pr-[max(3rem,env(safe-area-inset-right))]">
      <Button variant="default" size="sm" onClick={() => onOpenChange(false)} className="absolute left-[max(1.25rem,env(safe-area-inset-left))] top-[calc(1rem+env(safe-area-inset-top))] h-10 gap-2 rounded-lg px-4 text-white shadow-sm hover:text-white has-[>svg]:px-4">
        <ArrowLeft aria-hidden="true" className="size-4" />返回首页
      </Button>
      <div className="mx-auto my-auto grid w-full max-w-4xl shrink-0 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-16 md:gap-y-12 lg:gap-x-28 lg:gap-y-16">
        <DialogTitle className="min-w-0 break-words text-[clamp(1.75rem,3.8vw,3.5rem)] font-semibold leading-tight tracking-tight md:col-start-1 md:row-start-1">暂无模板</DialogTitle>
        <DialogDescription className="min-w-0 break-words text-base font-medium leading-8 text-neutral-700 md:col-start-2 md:row-start-1 md:text-right">进入<span className="text-primary">工作台</span>，<br />创建你的<span className="text-primary">第一个模板。</span></DialogDescription>
        <Button size="lg" onClick={onEnter} className="group h-14 w-full min-w-0 gap-3 rounded-xl px-7 text-base font-semibold text-white shadow-sm hover:text-white has-[>svg]:px-7 md:col-start-2 md:row-start-2 md:w-auto md:min-w-48 md:justify-self-end md:self-end lg:h-16 lg:min-w-52">
          进入工作台<ArrowRight aria-hidden="true" className="size-5 transition-transform motion-reduce:transition-none motion-safe:group-hover:translate-x-0.5" />
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
