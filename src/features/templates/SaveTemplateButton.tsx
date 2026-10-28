import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditor } from '@/features/editor/model/store'
import { lineIds } from '@/features/editor/model/object-checks'
import { SaveTemplateDialog } from './SaveTemplateDialog'
import type { TemplateRange } from './TemplateSaveRange'

export function SaveTemplateButton({ disabled = false }: { disabled?: boolean }) {
  const doc = useEditor(s => s.present.doc)
  const checkedObjects = useEditor(s => s.checkedObjects)
  const selected = useEditor(s => s.present.selected)
  const hasContent = Object.values(doc.nodes).some(node => node.type === 'line') || !!doc.marks?.length
  const [range, setRange] = useState<TemplateRange | null>(null)
  return <>
    <Button variant="outline" disabled={disabled || !doc.image || !hasContent} title={hasContent ? '将当前线条和标记块保存为可复用的模板' : '画线或添加标记块后即可保存模板'} onClick={() => setRange(checkedObjects.length || lineIds(doc, selected).length ? 'checked' : 'all')}><Save />保存为模板</Button>
    {range && <SaveTemplateDialog disabled={disabled} initialRange={range} onClose={() => setRange(null)} />}
  </>
}
