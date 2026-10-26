import { Link } from 'react-router-dom'
import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'

export function HomeHeader() {
  return <header className="mx-auto flex h-24 w-full max-w-[1320px] shrink-0 items-center justify-between gap-4 px-6 sm:px-10 lg:px-14">
    <Link to="/" aria-label="LineNest 首页" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"><Brand /></Link>
    <div className="flex items-center gap-8"><span className="hidden text-xs text-muted-foreground sm:block">自由布局，轻松分图</span><Button asChild variant="outline" size="sm" className="h-10 rounded-full border-foreground/20 bg-transparent px-4 shadow-none"><Link to="/editor">进入工作台<ArrowUpRight className="size-3.5" /></Link></Button></div>
  </header>
}
