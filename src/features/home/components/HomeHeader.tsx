import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { HomeAnimatedText } from './HomeAnimatedText'

export function HomeHeader() {
  return <header className="home-header mx-auto flex min-h-24 w-full max-w-[1320px] shrink-0 flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10 lg:px-14">
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        <Link to="/" aria-label="LineNest 首页" className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"><img src={`${import.meta.env.BASE_URL}linenest.svg`} alt="" aria-hidden="true" width={40} height={40} className="home-brand-icon size-10" /></Link>
        <Link to="/" className="w-fit rounded-sm font-brand text-3xl font-bold leading-none tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-[34px]"><span className="home-brand-wordmark inline-block">LineNest</span></Link>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild size="sm" className="home-header-enter h-10 rounded-full border-0 bg-primary px-4 font-semibold tracking-[0.1em] text-white shadow-none hover:bg-primary/90"><Link to="/editor" state={{ showImageImport: true }}><HomeAnimatedText delay={160} stagger={40}>进入工作台</HomeAnimatedText></Link></Button>
    </div>
  </header>
}
