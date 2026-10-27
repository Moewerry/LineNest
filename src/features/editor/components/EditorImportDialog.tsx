import { ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function EditorImportDialog({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (open: boolean) => void; onPick: () => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-sm">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary"><ImagePlus aria-hidden="true" className="size-6" /></div>
      <DialogHeader>
        <DialogTitle>从一张图片开始</DialogTitle>
        <DialogDescription>导入图片，画线分割。</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>稍后导入</Button>
        <Button onClick={onPick}>选择图片</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
