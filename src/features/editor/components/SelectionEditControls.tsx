import { ArrowUpLeft, MousePointer2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { bounds, containsLocked, containsSplit, isLocked } from '../geometry'
import { enterGroup, leaveGroup } from '../commands'
import type { Snapshot } from '../model/types'
import { isMarkObject } from '../model/mark-objects'

export function SelectionEditControls({ snapshot }: { snapshot: Snapshot }) {
  const { doc, selected, scope } = snapshot
  const node = selected.length === 1 ? doc.nodes[selected[0]] : null
  const group = node?.type === 'group' && !isMarkObject(node) ? node : null
  const hasObjects = !!group && group.children.length > 0
  if (!group && !scope) return null
  const box = group ? bounds(doc, [group.id]) : null
  const fixedDirection = containsSplit(doc, group ? [group.id] : selected)
  const locked = group && containsLocked(doc, group.id)
  const instruction = group
    ? locked ? '包含锁定对象，请先在图层中解锁后移动或缩放。'
      : fixedDirection ? '拖动对象或虚线边框移动；编辑对象可调整组内布局。'
        : '拖动模板或虚线边框移动，四角等比缩放，边缘调整宽高。'
    : fixedDirection ? '分割线保持贯穿图片：横线上下移动，竖线左右移动。'
      : '拖动对象调整位置；线条可拖动端点调整形状，双击子组继续编辑。'

  return <div className="pointer-events-auto max-w-full space-y-2 rounded-xl border bg-card px-3 py-2.5">
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-0 max-w-48 truncate text-xs font-medium">{group?.name ?? doc.nodes[scope!].name}</span>
      {box && <span className="text-xs tabular-nums text-muted-foreground">{Math.round(box.width)} × {Math.round(box.height)} px</span>}
      {group && hasObjects && <Button variant="outline" size="sm" className="h-7 text-xs" disabled={isLocked(doc, group.id)} title="进入组内编辑（双击或 Enter）" onClick={() => enterGroup(group.id)}><MousePointer2 />编辑对象</Button>}
      {scope && <Button variant="outline" size="sm" className="h-7 text-xs" title="退出组内编辑（Esc）" onClick={leaveGroup}><ArrowUpLeft />退出组内编辑</Button>}
    </div>
    <p className="text-xs leading-5 text-muted-foreground">{instruction}</p>
  </div>
}
