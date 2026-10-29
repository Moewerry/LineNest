import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function EraserSettings({ busy, onDeleteImage }: { busy: boolean; onDeleteImage: () => void }) {
  const [open, setOpen] = useState(false)

  return <Dialog open={open} onOpenChange={setOpen}>
    <div data-editor-settings className="absolute bottom-24 left-7 z-10 rounded-xl border bg-card p-1.5 sm:bottom-14 sm:left-10" onContextMenu={event => event.stopPropagation()}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={busy} aria-label="删除图片及全部内容" title="删除图片及全部内容" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
    </div>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>删除图片及全部内容？</DialogTitle>
        <DialogDescription>将清空图片和所有编辑内容，可撤销恢复。</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline" autoFocus>取消</Button></DialogClose>
        <Button variant="destructive" disabled={busy} onClick={() => {
          if (busy) return
          setOpen(false)
          onDeleteImage()
        }}>确认删除</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
