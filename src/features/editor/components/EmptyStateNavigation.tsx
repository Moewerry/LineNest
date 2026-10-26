import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function EmptyStateNavigation({ busy }: { busy: boolean }) {
  const navigate = useNavigate()
  return <nav aria-label="工作台入口导航" className="absolute left-5 top-4">
    <Button variant="ghost" size="sm" disabled={busy} onClick={() => navigate('/')} className="gap-2 rounded-full bg-white/90 px-4 text-foreground hover:bg-neutral-100 hover:text-primary">
      <ArrowLeft aria-hidden="true" className="size-4" />返回首页
    </Button>
  </nav>
}
