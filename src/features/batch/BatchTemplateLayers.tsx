import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BatchTemplate } from './types'

export function BatchTemplateLayers({ templates, active, disabled, onSelect }: {
  templates: BatchTemplate[]; active: string | null; disabled: boolean; onSelect: (id: string | null) => void
}) {
  const layers = [{ id: null, name: '全部模板' }, ...templates]
  return <div className="flex flex-wrap gap-2" role="group" aria-label="选择预览和编辑的模板层级">
    {layers.map(layer => <Button key={layer.id ?? 'all'} variant="outline" size="sm" disabled={disabled}
      aria-pressed={active === layer.id} onClick={() => onSelect(layer.id)}
      className={cn('max-w-full bg-transparent shadow-none hover:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent', active === layer.id && 'border-primary text-primary hover:text-primary')}>
      <span className="truncate">{layer.name}</span>
    </Button>)}
  </div>
}
