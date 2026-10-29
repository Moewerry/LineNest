import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditor } from '../model/store'
import { ShortcutKeys } from './ShortcutKeys'
import { toolGuides, toolOrder } from './tool-guide'
import { BuiltinTemplateButton } from '@/features/templates/BuiltinTemplateButton'
export function ToolBar({ busy }: { busy: boolean }) {
  const tool = useEditor(s => s.tool), ready = useEditor(s => !!s.present.doc.image)
  return <nav data-canvas-shortcuts aria-label="编辑工具" className="flex min-h-0 w-12 shrink-0 flex-col border-r border-[var(--workspace-divider)] bg-card sm:w-16">
    <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto px-0.5 py-2 sm:gap-1.5 sm:px-1.5 sm:py-3">
    {toolOrder.map(id => {
      const { label, shortcut, description, icon: Icon } = toolGuides[id]
      return <Tooltip key={id}>
        <TooltipTrigger asChild><Button size="icon" className="size-11 rounded-xl shadow-none" variant={tool === id ? 'selected' : 'ghost'} aria-label={`${label}，快捷键 ${shortcut}`} aria-keyshortcuts={shortcut} aria-pressed={tool === id} disabled={!ready || busy} onClick={() => useEditor.getState().setTool(id, true)}><Icon aria-hidden="true" className="size-[18px]" /></Button></TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="max-w-60 space-y-1.5 rounded-lg px-3 py-2.5 text-left">
          <div className="flex items-center justify-between gap-6 font-medium"><span>{label}</span><ShortcutKeys keys={[shortcut]} /></div>
          <p className="text-[11px] leading-relaxed">{description}</p>
        </TooltipContent>
      </Tooltip>
    })}
    </div>
    <div className="flex shrink-0 justify-center border-t border-[var(--workspace-divider)] px-1.5 py-3"><BuiltinTemplateButton disabled={busy} /></div>
  </nav>
}
