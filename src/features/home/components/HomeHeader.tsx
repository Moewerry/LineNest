import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function HomeHeader() {
  return <header className="mx-auto flex min-h-24 w-full max-w-[1240px] shrink-0 flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        <Link to="/" aria-label="LineNest 首页" className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"><img src={`${import.meta.env.BASE_URL}linenest.svg`} alt="" aria-hidden="true" width={32} height={32} className="size-8" /></Link>
        <Link to="/" className="w-fit rounded-sm font-brand text-2xl font-semibold leading-none tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring">LineNest</Link>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" size="sm" className="h-10 rounded-xl px-4 shadow-none"><Link to="/editor" state={{ showImageImport: true }}>进入工作台</Link></Button>
    </div>
  </header>
}
