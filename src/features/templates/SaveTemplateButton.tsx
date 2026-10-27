import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditor } from '@/features/editor/model/store'
import { SaveTemplateDialog } from './SaveTemplateDialog'
import type { TemplateRange } from './TemplateSaveRange'

export function SaveTemplateButton({ disabled = false }: { disabled?: boolean }) {
  const doc = useEditor(s => s.present.doc)
  const checkedObjects = useEditor(s => s.checkedObjects)
  const hasLines = Object.values(doc.nodes).some(node => node.type === 'line')
  const [range, setRange] = useState<TemplateRange | null>(null)
  return <>
    <Button variant="outline" disabled={disabled || !doc.image || !hasLines} title={hasLines ? '将当前线条保存为可复用的模板' : '画线后即可保存模板'} onClick={() => setRange(checkedObjects.length ? 'checked' : 'all')}><Save />保存为模板</Button>
    {range && <SaveTemplateDialog disabled={disabled} initialRange={range} onClose={() => setRange(null)} />}
  </>
}
