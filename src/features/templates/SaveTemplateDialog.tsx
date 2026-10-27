import { useId, useMemo, useRef, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { saveTemplate } from '@/lib/db'
import { toast } from '@/lib/toast'
import { useEditor } from '@/features/editor/model/store'
import { lineTemplateFromDocument } from './layout'
import { selectedTemplateDocument } from './selected-document'
import { TemplateSaveRange, type TemplateRange } from './TemplateSaveRange'
import { TemplateSavePreview } from './TemplateSavePreview'

export function SaveTemplateDialog({ disabled, initialRange, onClose }: { disabled: boolean; initialRange: TemplateRange; onClose: () => void }) {
  const doc = useEditor(s => s.present.doc)
  const checkedObjects = useEditor(s => s.checkedObjects)
  const [name, setName] = useState('')
  const [range, setRange] = useState<TemplateRange>(initialRange)
  const [saving, setSaving] = useState(false)
  const operation = useRef(false)
  const nameId = useId()
  const total = Object.values(doc.nodes).filter(node => node.type === 'line').length
  const count = range === 'checked' ? checkedObjects.length : total
  const preview = useMemo(() => {
    if (!doc.image || (range === 'checked' && !checkedObjects.length)) return { layout: null, error: null }
    try {
      const source = range === 'checked' ? selectedTemplateDocument(doc, checkedObjects) : doc
      return { layout: lineTemplateFromDocument(source), error: null }
    } catch (error) {
      return { layout: null, error: error instanceof Error ? error.message : '无法生成模板预览' }
    }
  }, [doc, range, checkedObjects])

  return <Dialog open onOpenChange={open => { if (!open && !operation.current) onClose() }}>
    <DialogContent className="gap-0 p-0 sm:max-w-3xl" showCloseButton={!saving}>
      <DialogHeader className="px-6 pt-6 text-left sm:px-8 sm:pt-8">
        <DialogTitle className="pr-6 text-xl leading-7">创建线条模板</DialogTitle>
        <DialogDescription className="leading-6">将画好的线条存入「我的模板」，下次处理图片时直接复用。</DialogDescription>
      </DialogHeader>
      <form onSubmit={async event => {
        event.preventDefault()
        if (operation.current || disabled || !name.trim() || !count || !preview.layout) return
        operation.current = true
        setSaving(true)
        try {
          await saveTemplate(name, doc, range === 'checked' ? checkedObjects : undefined)
          toast.success('已保存到「我的模板」')
          onClose()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : '保存模板失败')
        } finally {
          operation.current = false
          setSaving(false)
        }
      }}>
        <div className="grid gap-6 px-6 py-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] sm:gap-8 sm:px-8 sm:py-8">
          <div className="space-y-7">
            <div className="space-y-3">
              <label htmlFor={nameId} className="text-sm font-medium">模板名称</label>
              <Input id={nameId} placeholder="例如：四宫格、商品详情切图" maxLength={80} value={name} disabled={saving || disabled} required className="h-11" aria-describedby={`${nameId}-hint`} onChange={event => setName(event.target.value)} />
              <p id={`${nameId}-hint`} className="text-xs leading-5 text-muted-foreground">起一个方便下次查找的名字。</p>
            </div>
            <TemplateSaveRange value={range} onChange={setRange} total={total} checked={checkedObjects.length} disabled={saving || disabled} />
          </div>
          <TemplateSavePreview layout={preview.layout} count={count} error={preview.error} />
        </div>
        <DialogFooter className="gap-3 border-t bg-muted/20 px-6 py-5 sm:items-center sm:px-8">
          <p className="text-xs leading-5 text-muted-foreground sm:mr-auto">保存在当前浏览器中</p>
          <Button type="button" variant="outline" className="h-10 sm:min-w-20" disabled={saving} onClick={onClose}>取消</Button>
          <Button type="submit" className="h-10 sm:min-w-28" disabled={saving || disabled || !name.trim() || !count || !preview.layout}><Save />{saving ? '正在保存…' : '保存模板'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
