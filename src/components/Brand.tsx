import { Layers3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Brand({ className }: { className?: string }) {
  return <span className={cn('inline-flex shrink-0 items-center gap-2.5 font-semibold tracking-tight', className)}><span className="rounded-lg bg-primary p-2"><Layers3 className="size-5" /></span><span className="text-lg">LineNest</span></span>
}
