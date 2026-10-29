import { ChevronDown, Crop, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useEditor } from '../model/store'
import type { Box } from '../model/types'

export function CropObjectRow() {
  const crop = useEditor(state => state.present.doc.crop)
  if (!crop) return null

  const update = (key: keyof Box, text: string) => {
    const value = Number(text), state = useEditor.getState()
    const { crop: current, image } = state.present.doc
    if (!text.trim() || !Number.isFinite(value) || !current || !image) return
    const next = { ...current }
    if (key === 'x') next.x = Math.max(0, Math.min(value, image.width - next.width))
    if (key === 'y') next.y = Math.max(0, Math.min(value, image.height - next.height))
    if (key === 'width') next.width = Math.max(1, Math.min(value, image.width - next.x))
    if (key === 'height') next.height = Math.max(1, Math.min(value, image.height - next.y))
    state.setCrop(next)
  }

  return <Collapsible defaultOpen role="treeitem" aria-label="裁剪选区" className="mb-2 rounded-lg bg-secondary/40">
    <div className="flex items-center gap-1 px-2 py-1">
      <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="min-w-0 flex-1 justify-start text-xs"><Crop className="size-3.5" />裁剪选区<ChevronDown className="ml-auto size-3" /></Button></CollapsibleTrigger>
      <Button variant="ghost" size="icon-xs" aria-label="删除裁剪选区" title="删除裁剪选区" onClick={() => useEditor.getState().setCrop(null)}><Trash2 /></Button>
    </div>
    <CollapsibleContent className="space-y-2 px-3 pb-3">
      <div className="grid grid-cols-2 gap-2">
        {([['x', 'X'], ['y', 'Y'], ['width', '宽度'], ['height', '高度']] as const).map(([key, label]) => <label key={key} className="space-y-1 text-[11px] text-muted-foreground">
          <span>{label} · px</span>
          <Input key={crop[key]} type="number" step="1" min={key === 'x' || key === 'y' ? 0 : 1} defaultValue={Number(crop[key].toFixed(2))} className="h-8 text-xs" onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }} onBlur={event => update(key, event.currentTarget.value)} />
        </label>)}
      </div>
      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => useEditor.getState().setTool('crop', true)}><Crop />重新框选</Button>
    </CollapsibleContent>
  </Collapsible>
}
