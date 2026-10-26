import { useRef, useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { saveTemplate } from '@/lib/db'
import { useEditor } from '@/features/editor/model/store'

export function SaveTemplateButton({ disabled = false }: { disabled?: boolean }) {
  const doc = useEditor(s => s.present.doc)
  const hasLines = Object.values(doc.nodes).some(node => node.type === 'line')
  const [open, setOpen] = useState(false), [name, setName] = useState(''), [saving, setSaving] = useState(false)
  const operation = useRef(false)
  return <>
    <Button variant="outline" disabled={disabled || !doc.image || !hasLines} title={hasLines ? '保存当前画布上的线条' : '画线后即可保存模板'} onClick={() => setOpen(true)}><Save />保存模板</Button>
    <Dialog open={open} onOpenChange={value => { if (!operation.current) setOpen(value) }}><DialogContent>
      <DialogHeader><DialogTitle>保存线条模板</DialogTitle><DialogDescription>保存当前线条及其位置，供批量裁剪复用。原图、裁剪选区和区域标记不会保存。</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={async event => {
        event.preventDefault()
        if (operation.current || disabled) return
        operation.current = true; setSaving(true)
        try { await saveTemplate(name, useEditor.getState().present.doc); setOpen(false); setName(''); toast.success('模板已保存，可在批量裁剪模式中选择') }
        catch (error) { toast.error(error instanceof Error ? error.message : '保存模板失败') }
        finally { operation.current = false; setSaving(false) }
      }}>
        <Input aria-label="模板名称" placeholder="输入模板名称" maxLength={80} value={name} disabled={saving} onChange={event => setName(event.target.value)} />
        <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>取消</Button><Button type="submit" disabled={saving || disabled || !name.trim()}>{saving ? '正在保存…' : '保存模板'}</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  </>
}
