import { Link } from 'react-router-dom'
import { PenLine, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WorkspaceModeSwitch({ mode, disabled = false }: { mode: 'editor' | 'batch'; disabled?: boolean }) {
  const { label, path, icon: Icon } = mode === 'editor'
    ? { label: '批量裁剪', path: '/batch', icon: Scissors }
    : { label: '画线分图', path: '/editor', icon: PenLine }

  return <Button asChild={!disabled} disabled={disabled} variant="toolbar" className="max-sm:size-9 max-sm:p-0 max-sm:has-[>svg]:px-0" aria-label={`切换到${label}模式`} title={`切换到${label}模式`}>
    {disabled ? <><Icon aria-hidden="true" /><span className="hidden sm:inline">{label}</span></> : <Link to={path}><Icon aria-hidden="true" /><span className="hidden sm:inline">{label}</span></Link>}
  </Button>
}
