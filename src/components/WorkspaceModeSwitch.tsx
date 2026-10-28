import { Link } from 'react-router-dom'
import { PenLine, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WorkspaceModeSwitch({ mode, disabled = false }: { mode: 'editor' | 'batch'; disabled?: boolean }) {
  return <nav aria-label="工作模式" className="flex shrink-0 items-center gap-1 rounded-xl border bg-card p-1">
    {([{ id: 'editor', label: '画线分图', path: '/editor', icon: PenLine }, { id: 'batch', label: '批量裁剪', path: '/batch', icon: Scissors }] as const).map(({ id, label, path, icon: Icon }) =>
      <Button key={id} asChild={!disabled} disabled={disabled} size="sm" variant={mode === id ? 'selected' : 'ghost'} className="rounded-lg shadow-none" aria-current={mode === id ? 'page' : undefined}>
        {disabled ? <><Icon />{label}</> : <Link to={path}><Icon />{label}</Link>}
      </Button>)}
  </nav>
}
