import { Redo2, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditor } from '../model/store'

export function HistoryToolBar({ busy }: { busy: boolean }) {
  const canUndo = useEditor(s => s.past.length > 0)
  const canRedo = useEditor(s => s.future.length > 0)
  const hasLines = useEditor(s => Object.values(s.present.doc.nodes).some(node => node.type === 'line'))

  return <nav data-canvas-shortcuts aria-label="编辑历史和线条工具" className="flex shrink-0 items-center gap-1">
    <Button variant="ghost" size="icon" aria-label="撤回" title="撤回 Ctrl+Z / ⌘Z" disabled={busy || !canUndo} onClick={() => useEditor.getState().undo()}><Undo2 /></Button>
    <Button variant="ghost" size="icon" aria-label="恢复" title="恢复 Ctrl+Shift+Z / ⌘⇧Z" disabled={busy || !canRedo} onClick={() => useEditor.getState().redo()}><Redo2 /></Button>
    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="清除所有线条" title="清除所有线条（包括锁定线条），可撤回" disabled={busy || !hasLines} onClick={() => useEditor.getState().clearLines()}><X /></Button>
  </nav>
}
