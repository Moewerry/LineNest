import { Redo2, Trash2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditor } from '../model/store'

export function HistoryToolBar({ busy }: { busy: boolean }) {
  const canUndo = useEditor(s => s.past.length > 0)
  const canRedo = useEditor(s => s.future.length > 0)
  const hasLines = useEditor(s => Object.values(s.present.doc.nodes).some(node => node.type === 'line'))

  return <nav data-canvas-shortcuts aria-label="编辑历史和线条工具" className="flex shrink-0 items-center justify-center gap-1 border-t bg-card px-3 py-2">
    <Button variant="ghost" size="sm" title="撤回 Ctrl+Z / ⌘Z" disabled={busy || !canUndo} onClick={() => useEditor.getState().undo()}><Undo2 />撤回</Button>
    <Button variant="ghost" size="sm" title="恢复 Ctrl+Shift+Z / ⌘⇧Z" disabled={busy || !canRedo} onClick={() => useEditor.getState().redo()}><Redo2 />恢复</Button>
    <span aria-hidden="true" className="mx-2 h-4 border-l" />
    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" title="清除所有线条（包括锁定线条），可撤回" disabled={busy || !hasLines} onClick={() => useEditor.getState().clearLines()}><Trash2 />清除所有线条</Button>
  </nav>
}
