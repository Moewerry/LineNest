import { Redo2, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditor } from '../model/store'

export function HistoryToolBar({ busy }: { busy: boolean }) {
  const canUndo = useEditor(s => s.past.length > 0)
  const canRedo = useEditor(s => s.future.length > 0)
  const hasLines = useEditor(s => Object.values(s.present.doc.nodes).some(node => node.type === 'line'))

  return <nav data-canvas-shortcuts aria-label="编辑历史和线条工具" className="flex shrink-0 items-center gap-1">
    <Tooltip>
      <TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="撤回" disabled={busy || !canUndo} onClick={() => useEditor.getState().undo()}><Undo2 /></Button></TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={10} className="max-w-60 space-y-1.5 rounded-lg px-3 py-2.5 text-left">
        <p className="font-medium">撤回</p>
        <p className="text-[11px] leading-relaxed opacity-75">撤回上一步操作（Ctrl+Z / ⌘Z）。</p>
      </TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="恢复" disabled={busy || !canRedo} onClick={() => useEditor.getState().redo()}><Redo2 /></Button></TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={10} className="max-w-60 space-y-1.5 rounded-lg px-3 py-2.5 text-left">
        <p className="font-medium">恢复</p>
        <p className="text-[11px] leading-relaxed opacity-75">恢复已撤回的操作（Ctrl+Shift+Z / ⌘⇧Z）。</p>
      </TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="清除所有线条" disabled={busy || !hasLines} onClick={() => useEditor.getState().clearLines()}><X /></Button></TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={10} className="max-w-60 space-y-1.5 rounded-lg px-3 py-2.5 text-left">
        <p className="font-medium">清除所有线条</p>
        <p className="text-[11px] leading-relaxed opacity-75">清除所有线条（包括锁定线条），可撤回。</p>
      </TooltipContent>
    </Tooltip>
  </nav>
}
