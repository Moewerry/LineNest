import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

export function HomeNoTemplatesOverlay({ open, onOpenChange, onEnter }: { open: boolean; onOpenChange: (open: boolean) => void; onEnter: () => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} overlayClassName="bg-white/95 backdrop-blur-md" className="inset-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 items-center justify-center rounded-none border-0 bg-transparent px-6 py-24 shadow-none data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 sm:max-w-none sm:px-12">
      <Button variant="default" size="sm" onClick={() => onOpenChange(false)} className="absolute left-5 top-4 h-10 gap-2 rounded-lg px-4 text-white shadow-sm hover:text-white has-[>svg]:px-4">
        <ArrowLeft aria-hidden="true" className="size-4" />返回首页
      </Button>
      <div className="grid w-full max-w-4xl gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-16 sm:gap-y-12 lg:gap-x-28 lg:gap-y-16">
        <DialogTitle className="min-w-0 text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-tight tracking-tight sm:col-start-1 sm:row-start-1">暂无模板</DialogTitle>
        <DialogDescription className="text-base font-medium leading-8 text-neutral-700 sm:col-start-2 sm:row-start-1 sm:text-right">请进入工作台<br />创建你的第一个模板。</DialogDescription>
        <Button size="lg" onClick={onEnter} className="group h-14 min-w-48 gap-3 rounded-xl px-7 text-base font-semibold text-white shadow-sm hover:text-white has-[>svg]:px-7 sm:col-start-2 sm:row-start-2 sm:justify-self-end sm:self-end lg:h-16 lg:min-w-52">
          进入工作台<ArrowRight aria-hidden="true" className="size-5 transition-transform motion-reduce:transition-none motion-safe:group-hover:translate-x-0.5" />
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}
