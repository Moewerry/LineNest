import { useState } from 'react'
import { ChevronDown, ChevronRight, Folder, GripVertical, LockKeyhole, LockKeyholeOpen, PaintBucket, Slash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { objectIds } from '../model/object-checks'
import { cn } from '@/lib/utils'
import { isLocked } from '../geometry'
import { useEditor } from '../model/store'
import { enterGroup, focusNode, toggleLock } from '../commands'
import { useObjectSort } from '../hooks/use-object-sort'
import { ObjectNameInput } from './ObjectNameInput'
import { isMarkObject } from '../model/mark-objects'

export function ObjectTree({ id, depth = 0, index }: { id: string; depth?: number; index: number }) {
  const { doc, selected, scope } = useEditor(s => s.present), [expanded, setExpanded] = useState(true)
  const [renaming, setRenaming] = useState(false)
  const sort = useObjectSort(id)
  const node = doc.nodes[id], locked = isLocked(doc, id), inherited = !!node.parentId && isLocked(doc, node.parentId)
  const checkedObjects = useEditor(s => s.checkedObjects), checkObjects = useEditor(s => s.checkObjects)
  const objects = objectIds(doc, [id]), count = objects.filter(object => checkedObjects.includes(object)).length
  const group = node.type === 'group' && !isMarkObject(node)
  const Icon = isMarkObject(node) ? PaintBucket : group ? Folder : Slash
  const active = selected.includes(id)
  const controlClassName = 'text-inherit hover:bg-transparent hover:text-inherit'
  const isControl = (target: EventTarget) => target instanceof Element && !!target.closest('[data-object-control], [data-object-name]')
  return <div role="treeitem" aria-selected={active} aria-expanded={group ? expanded : undefined} tabIndex={0} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    onKeyDown={event => {
      if (event.target !== event.currentTarget) return
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); focusNode(id, event.shiftKey) }
    }}>
    <div data-object-row {...sort.rowProps}
      className={cn('relative mb-1 flex h-10 items-center gap-1 rounded-lg pr-1', (active || renaming) && 'bg-foreground text-card', scope === id && 'ring-1 ring-inset ring-ring/30', sort.dragging && 'opacity-50')}
      style={{ paddingLeft: 4 + depth * 12 }}
      onClick={event => { if (!isControl(event.target)) focusNode(id, event.shiftKey) }}
      onDoubleClick={event => { if (!isControl(event.target)) { focusNode(id, false); enterGroup(id) } }}>
      {sort.dropPosition && <span aria-hidden="true" className={cn('pointer-events-none absolute inset-x-0 z-10 border-t-2 border-primary', sort.dropPosition === 'before' ? 'top-0' : 'bottom-0')} />}
      <Checkbox data-object-control className={cn('mx-1 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-card data-[state=indeterminate]:border-foreground data-[state=indeterminate]:bg-foreground data-[state=indeterminate]:text-card', (active || renaming) && 'data-[state=checked]:border-card data-[state=indeterminate]:border-card')}
        aria-label={`勾选对象 ${node.name} ${index + 1}用于模板`} disabled={!objects.length} checked={count > 0 && count < objects.length ? 'indeterminate' : count > 0} onCheckedChange={value => checkObjects([id], value === true)} />
      {group ? <Button data-object-control size="icon-xs" variant="ghost" className={controlClassName} aria-label={expanded ? '收起组群' : '展开组群'} onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronDown /> : <ChevronRight />}</Button> : <span className="w-6 shrink-0" />}
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span aria-hidden="true" className="shrink-0 text-xs tabular-nums">{index + 1}</span>
      <ObjectNameInput id={id} name={node.name} locked={locked} onEditingChange={setRenaming} />
      <Button data-object-control variant="ghost" size="icon-xs" className={controlClassName} disabled={inherited} aria-label={node.locked ? '解锁对象' : '锁定对象'} title={inherited ? '请先解锁上级组群' : node.locked ? '解锁对象' : '锁定对象'} onClick={() => toggleLock(id)}>{node.locked || inherited ? <LockKeyhole className="size-3" /> : <LockKeyholeOpen className="size-3" />}</Button>
      <Button data-object-control variant="ghost" size="icon-xs" className={cn(controlClassName, 'cursor-grab active:cursor-grabbing')} disabled={locked || renaming} draggable={!locked && !renaming} aria-label={`拖动排序对象 ${node.name}`} title="拖动调整同级顺序，也可按 Alt+↑ / Alt+↓" {...sort.handleProps}><GripVertical aria-hidden="true" /></Button>
    </div>
    {node.type === 'group' && group && expanded && <div role="group">{node.children.map((child, i) => <ObjectTree key={child} id={child} depth={depth + 1} index={i} />)}</div>}
  </div>
}
