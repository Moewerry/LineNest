import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditor } from '../model/store'
import { ShortcutKeys } from './ShortcutKeys'
import { toolGuides, toolOrder } from './tool-guide'
export function ToolBar({ busy }: { busy: boolean }) {
  const tool = useEditor(s => s.tool), ready = useEditor(s => !!s.present.doc.image)
  const labels = { split: '分割', select: '选择', pan: '移动', line: '画线', crop: '选区', fill: '标记', erase: '擦除' }
  return <nav data-canvas-shortcuts aria-label="编辑工具" className="flex w-16 shrink-0 flex-col items-center gap-1.5 overflow-y-auto rounded-2xl border bg-card px-1.5 py-3">
    {toolOrder.map(id => {
      const { label, shortcut, description, icon: Icon } = toolGuides[id]
      return <Tooltip key={id}>
        <TooltipTrigger asChild><Button className="h-14 w-full shrink-0 flex-col gap-1 rounded-xl px-0 text-[10px] shadow-none" variant={tool === id ? 'secondary' : 'ghost'} aria-label={`${label}，快捷键 ${shortcut}`} aria-keyshortcuts={shortcut} aria-pressed={tool === id} disabled={!ready || busy} onClick={() => useEditor.getState().setTool(id)}><Icon className={`size-[18px] ${tool === id ? 'text-primary' : 'text-muted-foreground'}`} /><span>{labels[id]}</span></Button></TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="max-w-60 space-y-1.5 rounded-lg px-3 py-2.5 text-left">
          <div className="flex items-center justify-between gap-6 font-medium"><span>{label}</span><ShortcutKeys keys={[shortcut]} /></div>
          <p className="text-[11px] leading-relaxed opacity-75">{description}</p>
        </TooltipContent>
      </Tooltip>
    })}
  </nav>
}
