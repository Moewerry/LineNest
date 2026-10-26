import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { HomeAnimatedText } from './HomeAnimatedText'

export function HomeHeader() {
  return <header className="home-header mx-auto flex min-h-24 w-full max-w-[1320px] shrink-0 items-center justify-between gap-4 px-6 py-5 sm:px-10 lg:px-14">
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        <Link to="/" aria-label="LineNest 首页" className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"><img src="/linenest.svg" alt="" aria-hidden="true" width={48} height={48} className="home-brand-icon size-12" /></Link>
        <Link to="/" className="w-fit rounded-sm text-[48px] font-semibold leading-none tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring">LineNest</Link>
      </div>
      <p className="mt-2 text-[10px] leading-3 sm:text-[11px]"><a href="https://github.com/Moewerry/LineNest" target="_blank" rel="noopener noreferrer" className="rounded-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><HomeAnimatedText delay={100} stagger={16}>Moewerry’s personal studio</HomeAnimatedText></a></p>
    </div>
    <Button asChild size="sm" className="h-10 rounded-full border-0 bg-primary px-4 text-white shadow-none hover:bg-primary/90"><Link to="/editor"><HomeAnimatedText delay={160} stagger={40}>进入工作台</HomeAnimatedText></Link></Button>
  </header>
}
