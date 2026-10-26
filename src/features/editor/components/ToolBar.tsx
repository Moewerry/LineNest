import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditor } from '../model/store'
import { ShortcutKeys } from './ShortcutKeys'
import { toolGuides, toolOrder } from './tool-guide'
export function ToolBar({ busy }: { busy: boolean }) {
  const tool = useEditor(s => s.tool), ready = useEditor(s => !!s.present.doc.image)
  return <nav data-canvas-shortcuts aria-label="编辑工具" className="flex w-[72px] shrink-0 flex-col items-center gap-3 border-r bg-card py-5">
    {toolOrder.map(id => {
      const { label, shortcut, description, icon: Icon } = toolGuides[id]
      return <Tooltip key={id}>
        <TooltipTrigger asChild><Button size="icon" variant={tool === id ? 'default' : 'ghost'} aria-label={`${label}，快捷键 ${shortcut}`} aria-keyshortcuts={shortcut} aria-pressed={tool === id} disabled={!ready || busy} onClick={() => useEditor.getState().setTool(id)}><Icon className="size-[18px]" /></Button></TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="max-w-60 space-y-1.5 rounded-lg px-3 py-2.5 text-left">
          <div className="flex items-center justify-between gap-6 font-medium"><span>{label}</span><ShortcutKeys keys={[shortcut]} /></div>
          <p className="text-[11px] leading-relaxed opacity-75">{description}</p>
        </TooltipContent>
      </Tooltip>
    })}
  </nav>
}
