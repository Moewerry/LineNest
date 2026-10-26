import { cn } from '@/lib/utils'

export function Brand({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return <span className={cn('inline-flex shrink-0 items-center gap-2.5 font-semibold tracking-tight', className)}><img src="/linenest.svg" alt="" aria-hidden="true" width={36} height={36} className={cn('size-9 shrink-0', iconClassName)} /><span className="text-lg">LineNest</span></span>
}
