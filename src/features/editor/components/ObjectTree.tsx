import { useState } from 'react'
import { ChevronDown, ChevronRight, Folder, LockKeyhole, LockKeyholeOpen, Slash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isLocked } from '../geometry'
import { useEditor } from '../model/store'
import { enterGroup, focusNode, toggleLock } from '../commands'

export function ObjectTree({ id, depth = 0, index }: { id: string; depth?: number; index: number }) {
  const { doc, selected, scope } = useEditor(s => s.present), [expanded, setExpanded] = useState(true)
  const node = doc.nodes[id], locked = isLocked(doc, id), inherited = !!node.parentId && isLocked(doc, node.parentId)
  const Icon = node.type === 'group' ? Folder : Slash
  return <div>
    <div className={cn('mb-0.5 flex h-9 items-center rounded-lg pr-1', selected.includes(id) && 'bg-accent', scope === id && 'ring-1 ring-inset ring-ring/30')} style={{ paddingLeft: 4 + depth * 12 }}>
      {node.type === 'group' ? <Button size="icon-xs" variant="ghost" aria-label={expanded ? '收起组群' : '展开组群'} onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronDown /> : <ChevronRight />}</Button> : <span className="w-6 shrink-0" />}
      <Button variant="ghost" className={cn('h-8 min-w-0 flex-1 justify-start gap-2 px-1 text-xs font-normal', locked && 'opacity-45')} disabled={locked} onClick={e => focusNode(id, e.shiftKey)} onDoubleClick={() => { focusNode(id, false); enterGroup(id) }}><Icon className="size-3.5" /><span className="truncate">{node.name} {index + 1}</span></Button>
      <Button variant="ghost" size="icon-xs" disabled={inherited} aria-label={node.locked ? '解锁' : '锁定'} title={inherited ? '请先解锁上级组群' : node.locked ? '解锁' : '锁定'} onClick={() => toggleLock(id)}>{node.locked || inherited ? <LockKeyhole className="size-3" /> : <LockKeyholeOpen className="size-3 text-muted-foreground/50" />}</Button>
    </div>
    {node.type === 'group' && expanded && <div>{node.children.map((child, i) => <ObjectTree key={child} id={child} depth={depth + 1} index={i} />)}</div>}
  </div>
}
