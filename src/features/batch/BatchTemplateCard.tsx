import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TemplateThumbnail } from '@/features/templates/TemplateThumbnail'
import type { BatchTemplate } from './types'

export function BatchTemplateCard({ template, selected, disabled, onToggle }: {
  template: BatchTemplate; selected: boolean; disabled: boolean; onToggle: () => void
}) {
  return <Button data-batch-template-card variant="outline" disabled={disabled} aria-pressed={selected} aria-label={`${template.name}，${selected ? '已选中，点击取消' : '点击选择'}`} onClick={onToggle}
    className="group relative h-auto min-w-0 flex-col items-stretch gap-0 overflow-hidden rounded-xl bg-transparent p-0 text-left whitespace-normal shadow-none transition-colors [--border:var(--workspace-divider)] hover:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent">
    <TemplateThumbnail layout={template.layout} className="h-32 w-full rounded-none border-b bg-transparent p-4" />
    <span aria-hidden="true" className={cn('absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border bg-background shadow-xs', selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent')}><Check className="size-3" strokeWidth={2.5} /></span>
    <span className="flex min-w-0 items-center justify-between gap-2 p-3.5">
      <span className="min-w-0"><span className="block truncate text-sm font-medium" title={template.name}>{template.name}</span><span className="mt-1 block text-[11px] font-normal text-muted-foreground tabular-nums">{template.layout.width} × {template.layout.height} px</span></span>
      {selected && <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-medium text-primary">已选择</span>}
    </span>
  </Button>
}
