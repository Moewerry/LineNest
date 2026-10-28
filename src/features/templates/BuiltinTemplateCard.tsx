import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BuiltinTemplate } from './builtins'

export function BuiltinTemplateCard({ template, disabled, selected, onSelect }: {
  template: BuiltinTemplate; disabled: boolean; selected?: boolean; onSelect: () => void
}) {
  return <Button variant="outline" disabled={disabled} aria-pressed={selected} onClick={onSelect}
    className={cn('relative h-auto min-w-0 flex-col items-stretch gap-0 overflow-hidden rounded-xl bg-card p-0 text-left whitespace-normal shadow-none hover:border-primary/50 hover:bg-card', selected && 'border-primary')}>
    <span className="flex h-36 items-center justify-center border-b bg-secondary/40 p-5">
      <svg viewBox="0 0 240 160" aria-hidden="true" className="size-full text-primary">
        <rect x="16" y="16" width="208" height="128" rx="4" fill="var(--secondary)" stroke="var(--border)" />
        <rect x="56" y="16" width="128" height="128" fill="var(--card)" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x="120" y="84" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="22">1:1</text>
      </svg>
    </span>
    {selected && <span aria-hidden="true" className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span>}
    <span className="min-w-0 p-4"><span className="block text-sm font-medium">{template.name}</span></span>
  </Button>
}
