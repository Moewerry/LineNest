import { cn } from '@/lib/utils'

export function Brand({ className }: { className?: string }) {
  return <span className={cn('inline-flex shrink-0 items-center gap-2.5 font-semibold tracking-tight', className)}><img src="/linenest.svg" alt="" aria-hidden="true" width={36} height={36} className="size-9 shrink-0" /><span className="text-lg">LineNest</span></span>
}
