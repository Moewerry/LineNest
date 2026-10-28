import { Link } from 'react-router-dom'
import { PenLine, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WorkspaceModeSwitch({ mode, disabled = false }: { mode: 'editor' | 'batch'; disabled?: boolean }) {
  const { label, path, icon: Icon } = mode === 'editor'
    ? { label: '批量裁剪', path: '/batch', icon: Scissors }
    : { label: '画线分图', path: '/editor', icon: PenLine }

  return <Button asChild={!disabled} disabled={disabled} variant="ghost" aria-label={`切换到${label}模式`}>
    {disabled ? <><Icon aria-hidden="true" />{label}</> : <Link to={path}><Icon aria-hidden="true" />{label}</Link>}
  </Button>
}
