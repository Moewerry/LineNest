import { Link } from 'react-router-dom'
import { Brand } from '@/components/Brand'

export function HomeHeader() {
  return <header className="mx-auto flex h-[clamp(52px,10dvh,88px)] w-full max-w-[1440px] shrink-0 items-center justify-between px-6 md:px-12">
    <Link to="/" aria-label="LineNest 首页" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"><Brand /></Link>
    <span className="text-[11px] tracking-wide text-muted-foreground">手动布局 · 自由编组</span>
  </header>
}
