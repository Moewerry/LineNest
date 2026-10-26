import { Crop, Hand, MousePointer2, Slash, Grid2X2, PaintBucket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditor } from '../model/store'
import type { Tool } from '../model/types'
const tools = [
  { id: 'split', label: '分割线 · S（单击竖线，按住 W 单击横线）', icon: Grid2X2 },
  { id: 'select', label: '选择 · V', icon: MousePointer2 },
  { id: 'pan', label: '拖动画布 · H', icon: Hand },
  { id: 'line', label: '画线 · L', icon: Slash },
  { id: 'crop', label: '裁剪选区 · C', icon: Crop },
  { id: 'fill', label: '油漆桶 · B（标记需要裁切的区域）', icon: PaintBucket },
] satisfies { id: Tool; label: string; icon: typeof Crop }[]
export function ToolBar({ busy }: { busy: boolean }) {
  const tool = useEditor(s => s.tool), ready = useEditor(s => !!s.present.doc.image)
  return <nav data-canvas-shortcuts aria-label="编辑工具" className="flex w-[72px] shrink-0 flex-col items-center gap-3 border-r bg-card py-5">
    {tools.map(({ id, label, icon: Icon }) => <Tooltip key={id}>
      <TooltipTrigger asChild><Button size="icon" variant={tool === id ? 'default' : 'ghost'} aria-label={label} aria-pressed={tool === id} disabled={!ready || busy} onClick={() => useEditor.getState().setTool(id)}><Icon className="size-[18px]" /></Button></TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>)}
  </nav>
}
