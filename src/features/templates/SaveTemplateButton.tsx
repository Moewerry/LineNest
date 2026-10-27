import { useRef, useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { saveTemplate } from '@/lib/db'
import { useEditor } from '@/features/editor/model/store'
import { TemplateSaveRange, type TemplateRange } from './TemplateSaveRange'

export function SaveTemplateButton({ disabled = false }: { disabled?: boolean }) {
  const doc = useEditor(s => s.present.doc)
  const checkedObjects = useEditor(s => s.checkedObjects)
  const total = Object.values(doc.nodes).filter(node => node.type === 'line').length
  const hasLines = total > 0
  const [open, setOpen] = useState(false), [name, setName] = useState(''), [saving, setSaving] = useState(false)
  const [range, setRange] = useState<TemplateRange>('all')
  const operation = useRef(false)
  return <>
    <Button variant="outline" disabled={disabled || !doc.image || !hasLines} title={hasLines ? '保存线条模板' : '画线后即可保存模板'} onClick={() => { setRange(checkedObjects.length ? 'checked' : 'all'); setOpen(true) }}><Save />保存模板</Button>
    <Dialog open={open} onOpenChange={value => { if (!operation.current) setOpen(value) }}><DialogContent>
      <DialogHeader icon={<Save />}><DialogTitle>保存模板</DialogTitle><DialogDescription>仅保存线条及位置，供批量裁剪复用。</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={async event => {
        event.preventDefault()
        if (operation.current || disabled) return
        operation.current = true; setSaving(true)
        try {
          const state = useEditor.getState()
          await saveTemplate(name, state.present.doc, range === 'checked' ? state.checkedObjects : undefined)
          setOpen(false); setName(''); toast.success('模板已保存')
        }
        catch (error) { toast.error(error instanceof Error ? error.message : '保存模板失败') }
        finally { operation.current = false; setSaving(false) }
      }}>
        <TemplateSaveRange value={range} onChange={setRange} total={total} checked={checkedObjects.length} disabled={saving || disabled} />
        <Input aria-label="模板名称" placeholder="输入模板名称" maxLength={80} value={name} disabled={saving} onChange={event => setName(event.target.value)} />
        <DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>取消</Button><Button type="submit" disabled={saving || disabled || !name.trim() || !hasLines || (range === 'checked' && !checkedObjects.length)}>{saving ? '正在保存…' : '保存模板'}</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  </>
}
