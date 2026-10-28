import { useState } from 'react'
import { LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useEditor } from '@/features/editor/model/store'
import { toast } from '@/lib/toast'
import { pickUpBuiltinTemplate } from './apply'
import { builtinTemplates } from './builtins'
import { BuiltinTemplateCard } from './BuiltinTemplateCard'

export function BuiltinTemplateButton({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const hasImage = useEditor(state => !!state.present.doc.image)
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="ghost" size="icon" disabled={disabled} aria-label="打开内置模板" title="内置模板" className="size-11 rounded-xl"><LayoutTemplate aria-hidden="true" className="size-[18px] text-muted-foreground" /></Button></DialogTrigger>
    <DialogContent {...(hasImage ? { 'aria-describedby': undefined } : {})} className={`gap-6 rounded-2xl bg-card ${hasImage ? 'sm:max-w-2xl' : 'sm:max-w-sm'}`}>
      {hasImage ? <>
      <DialogHeader icon={<LayoutTemplate />}><DialogTitle>内置模板</DialogTitle></DialogHeader>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {builtinTemplates.map(template => <BuiltinTemplateCard key={template.id} template={template} disabled={disabled || !hasImage} onSelect={() => {
          if (disabled) return
          try { pickUpBuiltinTemplate(template.id); setOpen(false) }
          catch (error) { toast.error(error instanceof Error ? error.message : '套用失败') }
        }} />)}
      </div>
      </> : <>
        <DialogHeader icon={<LayoutTemplate />}>
          <DialogTitle>请先上传图片</DialogTitle>
          <DialogDescription>使用内置模板前，请先通过右上角「导入图片」上传一张图片。</DialogDescription>
        </DialogHeader>
        <DialogFooter><DialogClose asChild><Button>知道了</Button></DialogClose></DialogFooter>
      </>}
    </DialogContent>
  </Dialog>
}
