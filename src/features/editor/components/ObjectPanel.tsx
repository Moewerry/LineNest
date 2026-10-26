import { ArrowUpLeft } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useEditor } from '../model/store'
import { leaveGroup } from '../commands'
import { ObjectTree } from './ObjectTree'
import { PropertyPanel } from './PropertyPanel'
export function ObjectPanel() {
  const { doc, scope } = useEditor(s => s.present)
  return <aside className="flex w-[272px] shrink-0 flex-col border-l bg-card">
    <div className="flex h-16 items-center justify-between border-b px-5"><h2 className="text-xs font-semibold">对象与图层</h2><span className="rounded-full bg-secondary px-2 py-1 text-[10px] text-muted-foreground">{Object.values(doc.nodes).filter(n => n.type === 'line').length} 条线</span></div>
    {scope && <div className="border-b px-3 pb-2"><Button size="sm" variant="ghost" className="w-full justify-start text-xs" onClick={leaveGroup}><ArrowUpLeft />退出组内编辑</Button></div>}
    <ScrollArea className="min-h-0 flex-1 px-2">
      {doc.roots.length ? doc.roots.map((id, index) => <ObjectTree key={id} id={id} index={index} />) : <p className="px-3 py-3 text-xs text-muted-foreground">暂无线条</p>}
    </ScrollArea>
    <PropertyPanel />
  </aside>
}
