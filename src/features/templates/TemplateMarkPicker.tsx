import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { RegionMark } from '@/features/editor/model/types'

export function TemplateMarkPicker({ marks, selected, onChange, disabled }: {
  marks: RegionMark[]; selected: string[]; onChange: (ids: string[]) => void; disabled: boolean
}) {
  if (!marks.length) return null
  const selectedSet = new Set(selected)
  const count = marks.filter(mark => selectedSet.has(mark.id)).length
  return <div className="overflow-hidden rounded-xl border">
    <label className="flex cursor-pointer items-center gap-3 border-b bg-muted/30 px-4 py-3 text-xs">
      <Checkbox disabled={disabled} checked={count === marks.length ? true : count ? 'indeterminate' : false} onCheckedChange={checked => onChange(checked === true ? marks.map(mark => mark.id) : [])} />
      <span className="flex-1">全选标记块</span><span className="text-muted-foreground">已选 {count} / {marks.length}</span>
    </label>
    <ScrollArea className="h-40">
      <div className="space-y-1 p-2">
        {marks.map((mark, index) => <label key={mark.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-sm hover:bg-muted/50">
          <Checkbox disabled={disabled} checked={selectedSet.has(mark.id)} onCheckedChange={checked => onChange(checked === true ? [...selected, mark.id] : selected.filter(id => id !== mark.id))} />
          <span aria-hidden="true" className="size-3 shrink-0 rounded-sm border" style={{ backgroundColor: mark.color }} />
          <span className="min-w-0 flex-1">标记块 {index + 1}</span>
          <span className="text-xs text-muted-foreground">{Math.round(mark.opacity * 100)}%</span>
        </label>)}
      </div>
    </ScrollArea>
  </div>
}
