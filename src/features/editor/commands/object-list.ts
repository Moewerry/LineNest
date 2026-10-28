import { childrenOf, isLocked } from '../geometry'
import { useEditor } from '../model/store'
import type { DocumentData } from '../model/types'
import { orderMarksByObjects } from '../model/mark-objects'

export type ObjectDropPosition = 'before' | 'after'

export function canReorderObject(doc: DocumentData, id: string, targetId: string) {
  const source = doc.nodes[id], target = doc.nodes[targetId]
  return !!source && !!target && id !== targetId && source.parentId === target.parentId && !isLocked(doc, id) && !isLocked(doc, targetId)
}

export function reorderObject(id: string, targetId: string, position: ObjectDropPosition) {
  useEditor.getState().commit(({ doc }) => {
    if (!canReorderObject(doc, id, targetId)) return
    const siblings = childrenOf(doc, doc.nodes[id].parentId)
    const index = siblings.indexOf(id)
    if (index < 0 || !siblings.includes(targetId)) return
    siblings.splice(index, 1)
    siblings.splice(siblings.indexOf(targetId) + (position === 'after' ? 1 : 0), 0, id)
    orderMarksByObjects(doc)
  })
}

export function renameObject(id: string, name: string) {
  const nextName = name.trim().slice(0, 80)
  if (!nextName) return
  useEditor.getState().commit(({ doc }) => {
    if (doc.nodes[id] && !isLocked(doc, id)) doc.nodes[id].name = nextName
  })
}
