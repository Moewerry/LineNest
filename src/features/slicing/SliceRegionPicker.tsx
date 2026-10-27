import { Check, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SliceRegion } from './types'

type Props = {
  regions: SliceRegion[]
  selected: Set<number>
  disabled: boolean
  onChange: (selected: Set<number>) => void
}

export function SliceRegionPicker({ regions, selected, disabled, onChange }: Props) {
  return <section aria-label="选择导出区域" className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold">导出区域</h3>
        <span role="status" className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">已选 {selected.size} 张</span>
        <span className="text-xs text-muted-foreground">共 {regions.length} 个区域</span>
      </div>
      <Button size="sm" variant="ghost" disabled={disabled || !regions.length} onClick={() => onChange(selected.size === regions.length ? new Set() : new Set(regions.map(region => region.id)))}>{selected.size === regions.length && regions.length ? '取消全选' : '全选'}</Button>
    </div>
    {!!regions.length && <div className="grid gap-2 p-1 sm:grid-cols-2">
        {regions.map(region => {
          const included = selected.has(region.id)
          return <Button key={region.id} variant="outline" aria-label={`区域 ${region.id}，${region.box.width} × ${region.box.height} 像素`} aria-pressed={included} disabled={disabled}
            className={cn('h-auto min-w-0 justify-start gap-3 rounded-xl p-3 text-left shadow-none', included ? 'border-primary/40 bg-primary/5 hover:bg-primary/10' : 'text-muted-foreground')}
            onClick={() => { const next = new Set(selected); next.has(region.id) ? next.delete(region.id) : next.add(region.id); onChange(next) }}>
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', included ? 'bg-primary/10 text-primary' : 'bg-muted')}><Image aria-hidden="true" className="size-4" /></span>
            <span className="min-w-0 flex-1 space-y-1">
              <span className="block text-xs font-semibold text-foreground">区域 {region.id}</span>
              <span className="block text-[11px] font-normal tabular-nums text-muted-foreground">{region.box.width} × {region.box.height} px</span>
            </span>
            <span className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border', included ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
              {included && <Check aria-hidden="true" className="size-3" />}
            </span>
          </Button>
        })}
    </div>}
  </section>
}
