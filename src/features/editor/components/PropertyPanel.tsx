import { useState } from 'react'
import { Copy, FlipHorizontal2, FlipVertical2, Group, LockKeyhole, MoreHorizontal, RotateCw, Trash2, Ungroup } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { bounds, containsLocked, containsSplit, isLocked } from '../geometry'
import { useEditor } from '../model/store'
import { deleteSelection, duplicateSelection, enterGroup, groupSelection, lockSelection, mirrorSelection, rotateSelection, ungroupSelection } from '../commands'
import { isMarkObject } from '../model/mark-objects'

export function PropertyPanel() {
  const { doc, selected } = useEditor(s => s.present), [angle, setAngle] = useState('90')
  const box = bounds(doc, selected), blocked = !selected.length || selected.some(id => containsLocked(doc, id))
  const hasGroup = selected.some(id => doc.nodes[id].type === 'group' && !isMarkObject(doc.nodes[id]))
  const fixedDirection = containsSplit(doc, selected)
  return <div className="shrink-0 space-y-4 border-t border-[var(--workspace-divider)] p-4">
    <div className="flex items-center justify-between"><h2 className="text-xs font-medium">{selected.length ? `已选 ${selected.length} 个对象` : '属性'}</h2>
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" disabled={!selected.length} aria-label="对象操作"><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={blocked || fixedDirection} onSelect={() => mirrorSelection('horizontal')}><FlipHorizontal2 />水平镜像</DropdownMenuItem>
          <DropdownMenuItem disabled={blocked || fixedDirection} onSelect={() => mirrorSelection('vertical')}><FlipVertical2 />垂直镜像</DropdownMenuItem>
          <DropdownMenuItem disabled={blocked || fixedDirection} onSelect={() => rotateSelection(90)}><RotateCw />旋转 90°</DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[var(--workspace-divider)]" />
          <DropdownMenuItem onSelect={lockSelection}><LockKeyhole />锁定</DropdownMenuItem>
          <DropdownMenuItem disabled={blocked} variant="destructive" onSelect={deleteSelection}><Trash2 />删除</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    {box ? <>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={blocked} onClick={duplicateSelection}><Copy />复制</Button>
        {selected.length > 1 && <Button size="sm" variant="outline" disabled={blocked} onClick={groupSelection}><Group />编组</Button>}
        {hasGroup && <Button size="sm" variant="outline" disabled={blocked} onClick={ungroupSelection}><Ungroup />解组</Button>}
      </div>
      {selected.length === 1 && hasGroup && <Button variant="ghost" size="sm" className="w-full justify-start" disabled={isLocked(doc, selected[0])} onClick={() => enterGroup(selected[0])}>进入组内编辑</Button>}
      <div className="grid grid-cols-2 gap-3">
        {(['x', 'y'] as const).map(axis => <label key={axis} className="space-y-1.5 text-[11px] text-muted-foreground"><span>{axis.toUpperCase()} · px</span><Input key={`${selected.join(',')}:${box[axis]}`} type="number" step="1" defaultValue={Number(box[axis].toFixed(2))} disabled={blocked} className="h-8 text-xs" onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }} onBlur={e => {
          if (!e.target.value.trim()) return
          const value = Number(e.target.value), state = useEditor.getState(), current = bounds(state.present.doc, state.present.selected)
          if (!Number.isFinite(value) || !current) return
          state.move({ x: axis === 'x' ? value - current.x : 0, y: axis === 'y' ? value - current.y : 0 })
        }} /></label>)}
      </div>
      <div className="flex items-end gap-2"><label className="min-w-0 flex-1 space-y-1.5 text-[11px] text-muted-foreground"><span>旋转角度 · °</span><Input type="number" value={angle} onChange={e => setAngle(e.target.value)} className="h-8 text-xs" disabled={blocked || fixedDirection} /></label><Button variant="outline" size="sm" disabled={blocked || fixedDirection || !angle.trim() || !Number.isFinite(Number(angle))} onClick={() => rotateSelection(Number(angle))}>旋转</Button></div>
      {fixedDirection && <p className="text-[11px] text-muted-foreground">分割线保持贯穿图片：横线上下移动，竖线左右移动，不支持旋转或镜像。</p>}
      {blocked && <p className="text-[11px] text-muted-foreground">包含锁定对象，请先在对象列表解锁。</p>}
    </> : <p className="text-xs text-muted-foreground">选择对象以查看属性</p>}
    {doc.crop && <div className="flex items-center justify-between border-t border-[var(--workspace-divider)] pt-3"><span className="text-[11px] text-muted-foreground">选区 {Math.round(doc.crop.width)} × {Math.round(doc.crop.height)}</span><Button variant="ghost" size="sm" className="text-xs" onClick={() => useEditor.getState().setCrop(null)}>清除</Button></div>}
  </div>
}
