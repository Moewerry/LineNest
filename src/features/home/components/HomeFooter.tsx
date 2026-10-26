import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HomeFooter() {
  return <footer className="fixed bottom-4 left-4 z-30 sm:bottom-6 sm:left-6">
    <Button asChild size="icon" className="group h-10 w-10 justify-start gap-0 overflow-hidden rounded-full pl-2.5 pr-0 text-white shadow-md transition-[width] duration-300 ease-out hover:w-44 focus-visible:w-44 motion-reduce:transition-none">
      <a href="https://github.com/Moewerry/LineNest" target="_blank" rel="noopener noreferrer" aria-label="Made by Moewerry，前往 GitHub">
        <span aria-hidden="true" className="pointer-events-none flex size-5 shrink-0 origin-center items-center justify-center transform-gpu transition-transform duration-300 group-hover:rotate-12 group-focus-visible:rotate-12 motion-reduce:transition-none">
          <Github className="block size-5" />
        </span>
        <span aria-hidden="true" className="ml-2.5 whitespace-nowrap text-xs opacity-0 translate-x-2 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none">Made by Moewerry</span>
      </a>
    </Button>
  </footer>
}
