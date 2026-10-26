import { Link } from 'react-router-dom'
import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import { HomeAnimatedText } from './HomeAnimatedText'

export function HomeHeader() {
  return <header className="home-header mx-auto flex min-h-24 w-full max-w-[1320px] shrink-0 items-center justify-between gap-4 px-6 py-5 sm:px-10 lg:px-14">
    <div className="min-w-0">
      <Link to="/" aria-label="LineNest 首页" className="inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"><Brand iconClassName="home-brand-icon" /></Link>
      <p className="mt-2 text-[10px] leading-4 sm:text-[11px]"><a href="https://github.com/Moewerry/LineNest" target="_blank" rel="noopener noreferrer" className="rounded-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><HomeAnimatedText delay={100} stagger={16}>MOEWERRY’S PERSONAL STUDIO</HomeAnimatedText></a></p>
    </div>
    <div className="flex shrink-0 items-center gap-8"><span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><LockKeyhole aria-hidden="true" className="size-3 shrink-0" /><HomeAnimatedText delay={80}>图片留在本地，隐私更安心</HomeAnimatedText></span><Button asChild variant="outline" size="sm" className="h-10 rounded-full border-foreground/20 bg-transparent px-4 shadow-none"><Link to="/editor"><HomeAnimatedText delay={160} stagger={40}>进入工具台</HomeAnimatedText><ArrowUpRight className="size-3.5" /></Link></Button></div>
  </header>
}
