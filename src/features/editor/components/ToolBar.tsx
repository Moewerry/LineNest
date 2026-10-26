import { Crop, MousePointer2, Slash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditor } from '../model/store'
import type { Tool } from '../model/types'
const tools = [
  { id: 'select', label: '选择 · V', icon: MousePointer2 },
  { id: 'line', label: '画线 · L', icon: Slash },
  { id: 'crop', label: '裁剪选区 · C', icon: Crop },
] satisfies { id: Tool; label: string; icon: typeof Crop }[]
export function ToolBar() {
  const tool = useEditor(s => s.tool), ready = useEditor(s => !!s.present.doc.image)
  return <nav aria-label="编辑工具" className="flex w-[72px] shrink-0 flex-col items-center gap-3 border-r bg-card py-5">
    {tools.map(({ id, label, icon: Icon }) => <Tooltip key={id}>
      <TooltipTrigger asChild><Button size="icon" variant={tool === id ? 'default' : 'ghost'} aria-label={label} aria-pressed={tool === id} disabled={!ready} onClick={() => useEditor.getState().setTool(id)}><Icon className="size-[18px]" /></Button></TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>)}
  </nav>
}
