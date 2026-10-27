import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HomeFooter() {
  return <footer className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-3 px-6 pb-6 text-xs text-muted-foreground sm:px-10">
    <span>LineNest · 画一次，整组复用</span>
    <Button asChild variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground">
      <a href="https://github.com/Moewerry/LineNest" target="_blank" rel="noopener noreferrer" aria-label="Made by Moewerry，前往 GitHub">
        <Github aria-hidden="true" className="size-3.5" />Made by Moewerry
      </a>
    </Button>
  </footer>
}
