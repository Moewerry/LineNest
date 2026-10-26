import type { ReactNode } from 'react'
import { Copy, FlipHorizontal2, FlipVertical2, Group, LockKeyhole, RotateCw, Trash2, Ungroup } from 'lucide-react'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from '@/components/ui/context-menu'
import { containsLocked, containsSplit } from '../geometry'
import { useEditor } from '../model/store'
import { deleteSelection, duplicateSelection, enterGroup, groupSelection, lockSelection, mirrorSelection, rotateSelection, ungroupSelection } from '../commands'

export function CanvasContextMenu({ children, disabled }: { children: ReactNode; disabled: boolean }) {
  const { doc, selected, scope } = useEditor(s => s.present)
  const blocked = disabled || !selected.length || selected.some(id => containsLocked(doc, id))
  const singleGroup = selected.length === 1 && doc.nodes[selected[0]].type === 'group'
  const fixedDirection = containsSplit(doc, selected)
  return <ContextMenu><ContextMenuTrigger asChild disabled={disabled}>{children}</ContextMenuTrigger><ContextMenuContent className="w-52">
    <ContextMenuItem disabled={blocked} onSelect={duplicateSelection}><Copy />复制<ContextMenuShortcut>Ctrl+D</ContextMenuShortcut></ContextMenuItem>
    <ContextMenuItem disabled={blocked || selected.length < 2} onSelect={groupSelection}><Group />编组<ContextMenuShortcut>Ctrl+G</ContextMenuShortcut></ContextMenuItem>
    <ContextMenuItem disabled={blocked || !selected.some(id => doc.nodes[id].type === 'group')} onSelect={ungroupSelection}><Ungroup />解组</ContextMenuItem>
    <ContextMenuItem disabled={disabled || !singleGroup} onSelect={() => enterGroup(selected[0])}>进入组内编辑</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem disabled={blocked || fixedDirection} onSelect={() => mirrorSelection('horizontal')}><FlipHorizontal2 />水平镜像</ContextMenuItem>
    <ContextMenuItem disabled={blocked || fixedDirection} onSelect={() => mirrorSelection('vertical')}><FlipVertical2 />垂直镜像</ContextMenuItem>
    <ContextMenuItem disabled={blocked || fixedDirection} onSelect={() => rotateSelection(90)}><RotateCw />旋转 90°</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem disabled={disabled || !selected.length} onSelect={lockSelection}><LockKeyhole />锁定</ContextMenuItem>
    <ContextMenuItem disabled={blocked} variant="destructive" onSelect={deleteSelection}><Trash2 />删除<ContextMenuShortcut>Delete</ContextMenuShortcut></ContextMenuItem>
    {scope && <><ContextMenuSeparator /><ContextMenuItem onSelect={() => useEditor.getState().select([])}>取消选择</ContextMenuItem></>}
  </ContextMenuContent></ContextMenu>
}
