import { useEffect, useId, useRef, useState } from 'react'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HomeFooter() {
  const [expanded, setExpanded] = useState(false)
  const linkId = useId()
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!expanded) return

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !footerRef.current?.contains(event.target)) {
        setExpanded(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [expanded])

  return <footer ref={footerRef} className="fixed bottom-4 right-4 z-30 sm:bottom-6 sm:left-6 sm:right-auto">
    <div data-expanded={expanded} onKeyDown={event => { if (event.key === 'Escape') setExpanded(false) }} className="group flex h-10 w-10 items-center overflow-hidden rounded-full bg-primary text-white shadow-md transition-[width] duration-300 ease-out hover:w-44 has-[:focus-visible]:w-44 data-[expanded=true]:w-44 motion-reduce:transition-none">
      <Button type="button" size="icon" aria-label={expanded ? '收起作者信息' : '展开作者信息'} aria-expanded={expanded} aria-controls={linkId} onClick={() => setExpanded(value => !value)} className="size-10 shrink-0 rounded-full p-0 text-white shadow-none focus-visible:ring-inset">
        <span aria-hidden="true" className="pointer-events-none flex size-5 shrink-0 origin-center items-center justify-center transform-gpu transition-transform duration-300 group-hover:rotate-12 group-data-[expanded=true]:rotate-12 motion-reduce:transition-none">
          <Github className="block size-5" />
        </span>
      </Button>
      <Button asChild variant="link" className="invisible h-10 shrink-0 translate-x-2 rounded-full px-0 pr-4 text-xs text-white opacity-0 transition-[opacity,transform] duration-200 group-hover:visible group-hover:translate-x-0 group-hover:opacity-100 group-has-[:focus-visible]:visible group-has-[:focus-visible]:translate-x-0 group-has-[:focus-visible]:opacity-100 group-data-[expanded=true]:visible group-data-[expanded=true]:translate-x-0 group-data-[expanded=true]:opacity-100 motion-reduce:transition-none">
        <a id={linkId} href="https://github.com/Moewerry/LineNest" target="_blank" rel="noopener noreferrer" aria-label="Made by Moewerry，前往 GitHub">Made by Moewerry</a>
      </Button>
    </div>
  </footer>
}
