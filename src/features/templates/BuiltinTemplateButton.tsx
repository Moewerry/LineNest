import { useState } from 'react'
import { LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useEditor } from '@/features/editor/model/store'
import { toast } from '@/lib/toast'
import { applyBuiltinTemplate } from './apply'
import { builtinTemplates } from './builtins'
import { BuiltinTemplateCard } from './BuiltinTemplateCard'

export function BuiltinTemplateButton({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const hasImage = useEditor(state => !!state.present.doc.image)
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="ghost" disabled={disabled} aria-label="打开内置模板" title="内置模板" className="h-14 w-full flex-col gap-1 rounded-xl px-0 text-[10px]"><LayoutTemplate className="size-[18px] text-muted-foreground" /><span>内置模板</span></Button></DialogTrigger>
    <DialogContent className="gap-6 rounded-2xl bg-card sm:max-w-2xl">
      <DialogHeader icon={<LayoutTemplate />}><DialogTitle>内置模板</DialogTitle><DialogDescription>选择后立即套用，可撤销。将替换当前线条和裁剪选区。</DialogDescription></DialogHeader>
      {!hasImage && <p role="status" className="rounded-lg bg-secondary px-4 py-3 text-xs text-muted-foreground">请先导入图片，再选择模板。</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {builtinTemplates.map(template => <BuiltinTemplateCard key={template.id} template={template} disabled={disabled || !hasImage} onSelect={() => {
          if (disabled) return
          try { applyBuiltinTemplate(template.id); setOpen(false); toast.success(`已套用「${template.name}」，可在导出菜单中下载裁剪选区`) }
          catch (error) { toast.error(error instanceof Error ? error.message : '套用失败') }
        }} />)}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">网站自带，无法删除或重命名。你保存的模板仍在右侧「模板」面板中。</p>
    </DialogContent>
  </Dialog>
}
