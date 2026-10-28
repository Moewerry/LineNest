import { createContext, useContext, useEffect, useState, type Dispatch, type DragEvent, type KeyboardEvent, type ReactNode, type SetStateAction } from 'react'
import { canReorderObject, reorderObject, type ObjectDropPosition } from '../commands/object-list'
import { childrenOf, isLocked } from '../geometry'
import { useEditor } from '../model/store'

const OBJECT_DRAG_TYPE = 'application/x-linenest-object'
const ObjectSortContext = createContext<{ draggedId: string | null; setDraggedId: Dispatch<SetStateAction<string | null>> } | null>(null)

export function ObjectSortProvider({ children }: { children: ReactNode }) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  return <ObjectSortContext.Provider value={{ draggedId, setDraggedId }}>{children}</ObjectSortContext.Provider>
}

export function useObjectSort(id: string) {
  const context = useContext(ObjectSortContext)
  if (!context) throw new Error('对象排序必须位于 ObjectSortProvider 内')
  const { draggedId, setDraggedId } = context
  const [dropPosition, setDropPosition] = useState<ObjectDropPosition | null>(null)
  useEffect(() => setDropPosition(null), [draggedId])
  const accepts = (event: DragEvent<HTMLElement>) => !!draggedId && event.dataTransfer.types.includes(OBJECT_DRAG_TYPE) && canReorderObject(useEditor.getState().present.doc, draggedId, id)
  const position = (event: DragEvent<HTMLElement>): ObjectDropPosition => {
    const box = event.currentTarget.getBoundingClientRect()
    return event.clientY < box.top + box.height / 2 ? 'before' : 'after'
  }

  return {
    dragging: draggedId === id,
    dropPosition: draggedId ? dropPosition : null,
    handleProps: {
      onDragStart: (event: DragEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        if (isLocked(useEditor.getState().present.doc, id)) { event.preventDefault(); return }
        setDraggedId(id)
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData(OBJECT_DRAG_TYPE, id)
        const row = event.currentTarget.closest<HTMLElement>('[data-object-row]')
        if (row) event.dataTransfer.setDragImage(row, 16, row.offsetHeight / 2)
      },
      onDragEnd: () => { setDraggedId(null); setDropPosition(null) },
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return
        event.preventDefault(); event.stopPropagation()
        const { doc } = useEditor.getState().present, node = doc.nodes[id]
        if (!node) return
        const siblings = childrenOf(doc, node.parentId), index = siblings.indexOf(id)
        const targetId = siblings[index + (event.key === 'ArrowUp' ? -1 : 1)]
        if (targetId) reorderObject(id, targetId, event.key === 'ArrowUp' ? 'before' : 'after')
      },
    },
    rowProps: {
      onDragOver: (event: DragEvent<HTMLDivElement>) => {
        if (!accepts(event)) return
        event.preventDefault(); event.stopPropagation()
        event.dataTransfer.dropEffect = 'move'
        setDropPosition(position(event))
      },
      onDragLeave: (event: DragEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropPosition(null)
      },
      onDrop: (event: DragEvent<HTMLDivElement>) => {
        setDropPosition(null)
        if (!accepts(event)) return
        event.preventDefault(); event.stopPropagation()
        const sourceId = event.dataTransfer.getData(OBJECT_DRAG_TYPE)
        if (sourceId === draggedId) reorderObject(sourceId, id, position(event))
        setDraggedId(null)
      },
    },
  }
}
