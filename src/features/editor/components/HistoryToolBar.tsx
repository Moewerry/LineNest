import { Redo2, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditor } from '../model/store'

export function HistoryToolBar({ busy }: { busy: boolean }) {
  const canUndo = useEditor(s => s.past.length > 0)
  const canRedo = useEditor(s => s.future.length > 0)
  const hasContent = useEditor(s => Object.keys(s.present.doc.nodes).length > 0 || (s.present.doc.marks?.length ?? 0) > 0)

  return <nav data-canvas-shortcuts aria-label="编辑历史和清除工具" className="flex shrink-0 items-center gap-1">
    <Tooltip>
      <TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="撤回" disabled={busy || !canUndo} onClick={() => useEditor.getState().undo()}><Undo2 /></Button></TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={10} className="max-w-60 space-y-1.5 rounded-lg px-3 py-2.5 text-left">
        <p className="font-medium">撤回</p>
        <p className="text-[11px] leading-relaxed">撤回上一步操作（Ctrl+Z / ⌘Z）。</p>
      </TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="恢复" disabled={busy || !canRedo} onClick={() => useEditor.getState().redo()}><Redo2 /></Button></TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={10} className="max-w-60 space-y-1.5 rounded-lg px-3 py-2.5 text-left">
        <p className="font-medium">恢复</p>
        <p className="text-[11px] leading-relaxed">恢复已撤回的操作（Ctrl+Shift+Z / ⌘⇧Z）。</p>
      </TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="清除所有" disabled={busy || !hasContent} onClick={() => useEditor.getState().clearAll()}><X /></Button></TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={10} className="max-w-60 space-y-1.5 rounded-lg px-3 py-2.5 text-left">
        <p className="font-medium">清除所有</p>
        <p className="text-[11px] leading-relaxed">清除所有线条和标记色块（包括锁定内容），可撤回。</p>
      </TooltipContent>
    </Tooltip>
  </nav>
}
