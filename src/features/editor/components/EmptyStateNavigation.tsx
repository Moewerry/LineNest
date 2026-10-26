import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function EmptyStateNavigation({ busy }: { busy: boolean }) {
  const navigate = useNavigate()
  return <nav aria-label="工作台入口导航" className="absolute left-5 top-4">
    <Button variant="default" size="sm" disabled={busy} onClick={() => navigate('/')} className="h-10 gap-2 rounded-lg px-4 text-white shadow-sm hover:text-white has-[>svg]:px-4">
      <ArrowLeft aria-hidden="true" className="size-4" />返回首页
    </Button>
  </nav>
}
