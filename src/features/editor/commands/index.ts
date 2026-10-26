import { toast } from 'sonner'
import { bounds, childrenOf, containsLocked, identity, isLocked, multiply, translation } from '../geometry'
import { transformSelection, useEditor } from '../model/store'
import type { EditorNode, Matrix, Snapshot } from '../model/types'

const editable = (s: Snapshot) => s.selected.length > 0 && s.selected.every(id => !containsLocked(s.doc, id))
export const canEditSelection = () => editable(useEditor.getState().present)

export function groupSelection() {
  useEditor.getState().commit(s => {
    if (s.selected.length < 2 || !editable(s)) return
    const siblings = childrenOf(s.doc, s.scope), selected = siblings.filter(id => s.selected.includes(id))
    const id = crypto.randomUUID(), index = siblings.indexOf(selected[0])
    s.doc.nodes[id] = { id, type: 'group', name: '组群', parentId: s.scope, matrix: identity(), locked: false, children: selected }
    siblings.splice(0, siblings.length, ...siblings.filter(child => !selected.includes(child)))
    siblings.splice(index, 0, id)
    selected.forEach(child => { s.doc.nodes[child].parentId = id })
    s.selected = [id]
  })
  useEditor.getState().setTool('select')
}

export function ungroupSelection() {
  useEditor.getState().commit(s => {
    if (!editable(s)) return
    const next: string[] = []
    for (const id of s.selected) {
      const node = s.doc.nodes[id]
      if (node.type !== 'group') { next.push(id); continue }
      const siblings = childrenOf(s.doc, node.parentId), index = siblings.indexOf(id)
      for (const childId of node.children) {
        const child = s.doc.nodes[childId]
        child.matrix = multiply(node.matrix, child.matrix)
        child.parentId = node.parentId
      }
      siblings.splice(index, 1, ...node.children)
      next.push(...node.children)
      delete s.doc.nodes[id]
    }
    s.selected = next
  })
}

export function duplicateSelection() {
  if (!canEditSelection()) return
  useEditor.getState().commit(s => {
    const copy = (oldId: string, parentId: string | null): string => {
      const original = s.doc.nodes[oldId], id = crypto.randomUUID()
      const node: EditorNode = { ...structuredClone(original), id, parentId }
      s.doc.nodes[id] = node
      if (node.type === 'group') node.children = node.children.map(child => copy(child, id))
      return id
    }
    s.selected = s.selected.map(id => {
      const node = s.doc.nodes[id], siblings = childrenOf(s.doc, node.parentId)
      const newId = copy(id, node.parentId)
      siblings.splice(siblings.indexOf(id) + 1, 0, newId)
      return newId
    })
  })
  useEditor.getState().setTool('select')
  toast.success('已复制，拖动到需要的位置')
}

export function deleteSelection() {
  useEditor.getState().commit(s => {
    if (!editable(s)) return
    const remove = (id: string) => {
      const node = s.doc.nodes[id]
      if (node.type === 'group') [...node.children].forEach(remove)
      delete s.doc.nodes[id]
    }
    for (const id of s.selected) {
      const siblings = childrenOf(s.doc, s.doc.nodes[id].parentId)
      siblings.splice(siblings.indexOf(id), 1)
      remove(id)
    }
    s.selected = []
  })
}

function aroundCenter(linear: Matrix) {
  useEditor.getState().commit(s => {
    if (!editable(s)) return
    const box = bounds(s.doc, s.selected)
    if (!box) return
    const x = box.x + box.width / 2, y = box.y + box.height / 2
    transformSelection(s, multiply(multiply(translation(x, y), linear), translation(-x, -y)))
  })
}
export function mirrorSelection(axis: 'horizontal' | 'vertical') {
  aroundCenter(axis === 'horizontal' ? [-1, 0, 0, 1, 0, 0] : [1, 0, 0, -1, 0, 0])
}
export function rotateSelection(degrees: number) {
  if (!Number.isFinite(degrees)) return
  const radians = (degrees % 360) * Math.PI / 180, c = Math.cos(radians), s = Math.sin(radians)
  aroundCenter([c, s, -s, c, 0, 0])
}
export function toggleLock(id: string) {
  useEditor.getState().commit(s => {
    const node = s.doc.nodes[id]
    if (!node || (node.parentId && isLocked(s.doc, node.parentId))) return
    node.locked = !node.locked
    s.selected = s.selected.filter(selected => !isLocked(s.doc, selected))
  })
}
export function lockSelection() {
  useEditor.getState().commit(s => {
    s.selected.forEach(id => { s.doc.nodes[id].locked = true })
    s.selected = []
  })
}
export function enterGroup(id: string) {
  useEditor.getState().commit(s => {
    const node = s.doc.nodes[id]
    if (node?.type !== 'group' || node.parentId !== s.scope || isLocked(s.doc, id)) return
    s.scope = id; s.selected = []
  })
}
export function leaveGroup() {
  useEditor.getState().commit(s => {
    if (!s.scope) { s.selected = []; return }
    const id = s.scope
    s.scope = s.doc.nodes[id].parentId
    s.selected = [id]
  })
}
export function focusNode(id: string, additive: boolean) {
  useEditor.getState().commit(s => {
    const node = s.doc.nodes[id]
    if (!node || isLocked(s.doc, id)) return
    const old = s.scope === node.parentId ? s.selected : []
    s.scope = node.parentId
    s.selected = additive ? old.includes(id) ? old.filter(v => v !== id) : [...old, id] : [id]
  })
  useEditor.getState().setTool('select')
}
