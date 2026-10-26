import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'

export function HomeHeader() {
  return <header className="mx-auto flex h-24 w-full max-w-6xl items-center justify-between px-6 md:px-10">
    <Link to="/" aria-label="LineNest 首页" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"><Brand /></Link>
    <Button asChild variant="ghost" className="gap-3"><Link to="/editor">进入编辑器<ArrowUpRight className="size-4" /></Link></Button>
  </header>
}
