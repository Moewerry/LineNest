import { ArrowUpLeft } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { lineIds } from '../model/object-checks'
import { useEditor } from '../model/store'
import { leaveGroup } from '../commands'
import { ObjectTree } from './ObjectTree'
import { PropertyPanel } from './PropertyPanel'
export function ObjectPanel() {
  const { doc, scope } = useEditor(s => s.present)
  const checkedObjects = useEditor(s => s.checkedObjects), checkObjects = useEditor(s => s.checkObjects)
  const lines = lineIds(doc), count = checkedObjects.length
  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="flex items-center justify-between px-5 py-3"><h2 className="text-xs font-semibold">对象与图层</h2><span className="rounded-full bg-secondary px-2 py-1 text-[10px] text-muted-foreground">{Object.values(doc.nodes).filter(n => n.type === 'line').length} 条线</span></div>
    {!!lines.length && <label className="flex items-center gap-2 border-b border-[var(--workspace-divider)] px-3 py-2 text-xs text-muted-foreground">
      <Checkbox aria-label="全选线条用于模板" checked={count > 0 && count < lines.length ? 'indeterminate' : count > 0} onCheckedChange={value => checkObjects(doc.roots, value === true)} />
      <span className="flex-1">全选</span><span>已勾选 {count} 条线</span>
    </label>}
    {scope && <div className="border-b border-[var(--workspace-divider)] px-3 pb-2"><Button size="sm" variant="ghost" className="w-full justify-start text-xs" onClick={leaveGroup}><ArrowUpLeft />退出组内编辑</Button></div>}
    <ScrollArea className="min-h-0 flex-1 px-2">
      {doc.roots.length ? doc.roots.map((id, index) => <ObjectTree key={id} id={id} index={index} />) : <p className="px-3 py-3 text-xs text-muted-foreground">暂无线条</p>}
    </ScrollArea>
    <PropertyPanel />
  </div>
}
