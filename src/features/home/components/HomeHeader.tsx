import { Link } from 'react-router-dom'
import { Brand } from '@/components/Brand'

export function HomeHeader() {
  return <header className="mx-auto flex h-[clamp(48px,9dvh,80px)] w-full max-w-6xl shrink-0 items-center px-6 md:px-10">
    <Link to="/" aria-label="LineNest 首页" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"><Brand /></Link>
  </header>
}
