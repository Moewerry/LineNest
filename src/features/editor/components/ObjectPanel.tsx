import { Slash } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEditor } from '../model/store'
import { childrenOf } from '../geometry'
export function ObjectPanel() {
  const { doc, selected, scope } = useEditor(s => s.present)
  const ids = childrenOf(doc, scope)
  return <aside className="flex w-64 shrink-0 flex-col border-l bg-white">
    <div className="flex h-14 items-center justify-between px-5"><h2 className="text-xs font-medium">对象</h2><span className="text-xs text-muted-foreground">{ids.length}</span></div>
    <ScrollArea className="min-h-0 flex-1 px-2">
      {ids.length ? ids.map((id, index) => <Button key={id} variant="ghost" className={cn('mb-1 w-full justify-start text-xs font-normal', selected.includes(id) && 'bg-accent')} onClick={e => useEditor.getState().select(e.shiftKey ? selected.includes(id) ? selected.filter(v => v !== id) : [...selected, id] : [id])}><Slash className="size-3.5" />{doc.nodes[id].name} {index + 1}</Button>) : <p className="px-3 py-3 text-xs text-muted-foreground">暂无线条</p>}
    </ScrollArea>
    <div className="border-t p-5 text-xs leading-6 text-muted-foreground">Shift + 点击多选<br />拖动空白处框选<br />空格 + 拖动平移</div>
  </aside>
}
