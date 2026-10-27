import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { DocumentData } from '@/features/editor/model/types'
import { lineIds } from '@/features/editor/model/object-checks'

export function TemplateLinePicker({ doc, selected, onChange, disabled }: {
  doc: DocumentData
  selected: string[]
  onChange: (ids: string[]) => void
  disabled: boolean
}) {
  const ids = lineIds(doc)
  const selectedSet = new Set(selected)
  const count = ids.filter(id => selectedSet.has(id)).length
  return <div className="overflow-hidden rounded-xl border">
    <label className="flex cursor-pointer items-center gap-3 border-b bg-muted/30 px-4 py-3 text-xs">
      <Checkbox disabled={disabled} checked={count === ids.length && count > 0 ? true : count > 0 ? 'indeterminate' : false} onCheckedChange={checked => onChange(checked === true ? ids : [])} />
      <span className="flex-1">全选线条</span><span className="text-muted-foreground">已选 {count} / {ids.length}</span>
    </label>
    <ScrollArea className="h-40">
      <div className="space-y-1 p-2">
        {ids.map((id, index) => <label key={id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-sm hover:bg-muted/50">
          <Checkbox disabled={disabled} checked={selectedSet.has(id)} onCheckedChange={checked => onChange(checked === true ? [...selected, id] : selected.filter(value => value !== id))} />
          <span className="min-w-0 flex-1 truncate" title={doc.nodes[id].name}>{doc.nodes[id].name}</span>
          <span className="text-xs text-muted-foreground">#{index + 1}</span>
        </label>)}
      </div>
    </ScrollArea>
  </div>
}
