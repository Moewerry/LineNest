import { create } from 'zustand'
import { apply, childrenOf, containsLocked, containsSplit, identity, inverse, isLocked, multiply, normalizeSplitLines, segments, translation, worldMatrix } from '../geometry'
import { emptySnapshot, type Box, type ImageInfo, type Matrix, type Point, type Snapshot, type SplitAxis, type Tool } from './types'
import { rotateDocumentClockwise } from '../geometry/rotate-document'

type EditorState = {
  present: Snapshot; past: Snapshot[]; future: Snapshot[]; tool: Tool
  commit: (change: (draft: Snapshot) => void) => void
  setTool: (tool: Tool) => void
  setImage: (image: ImageInfo) => void
  rotateImage: (image: ImageInfo) => void
  select: (ids: string[]) => void
  addLine: (start: Point, end: Point, splitAxis?: SplitAxis) => void
  move: (delta: Point) => void
  endpoint: (id: string, end: 'start' | 'end', point: Point) => void
  setCrop: (crop: Box | null) => void
  undo: () => void; redo: () => void
}
export function transformSelection(draft: Snapshot, matrix: Matrix) {
  if (draft.selected.some(id => containsLocked(draft.doc, id))) return
  if (containsSplit(draft.doc, draft.selected) && (matrix[0] !== 1 || matrix[1] !== 0 || matrix[2] !== 0 || matrix[3] !== 1)) return
  for (const id of draft.selected) {
    const node = draft.doc.nodes[id], parent = worldMatrix(draft.doc, node.parentId)
    node.matrix = multiply(multiply(multiply(inverse(parent), matrix), parent), node.matrix)
  }
  normalizeSplitLines(draft.doc)
}
export const useEditor = create<EditorState>((set, get) => ({
  present: emptySnapshot(), past: [], future: [], tool: 'split',
  commit(change) {
    const current = get().present, next = structuredClone(current)
    change(next)
    if (JSON.stringify(current) === JSON.stringify(next)) return
    set(state => ({ present: next, past: [...state.past, current].slice(-100), future: [] }))
  },
  setTool: tool => set({ tool }),
  setImage(image) {
    get().commit(draft => Object.assign(draft, emptySnapshot(), { doc: { ...emptySnapshot().doc, image } }))
    set({ tool: 'split' })
  },
  rotateImage(image) { get().commit(draft => rotateDocumentClockwise(draft.doc, image)) },
  select(ids) {
    get().commit(draft => {
      const allowed = childrenOf(draft.doc, draft.scope)
      draft.selected = [...new Set(ids)].filter(id => allowed.includes(id) && !isLocked(draft.doc, id))
    })
  },
  addLine(start, end, splitAxis) {
    get().commit(draft => {
      if (!draft.doc.image || (draft.scope && isLocked(draft.doc, draft.scope))) return
      if (splitAxis && segments(draft.doc).some(segment => {
        const node = draft.doc.nodes[segment.id]
        return node.type === 'line' && node.splitAxis === splitAxis && (splitAxis === 'horizontal' ? segment.start.y === start.y : segment.start.x === start.x)
      })) return
      const id = crypto.randomUUID(), parent = inverse(worldMatrix(draft.doc, draft.scope))
      draft.doc.nodes[id] = { id, type: 'line', name: splitAxis ? splitAxis === 'horizontal' ? '横向分割线' : '竖向分割线' : '线条', parentId: draft.scope, matrix: identity(), locked: false, start: apply(parent, start), end: apply(parent, end), ...(splitAxis ? { splitAxis } : {}) }
      childrenOf(draft.doc, draft.scope).push(id)
      draft.selected = [id]
    })
  },
  move(delta) { get().commit(draft => transformSelection(draft, translation(delta.x, delta.y))) },
  endpoint(id, end, point) {
    get().commit(draft => {
      const node = draft.doc.nodes[id]
      if (node?.type !== 'line' || node.splitAxis || isLocked(draft.doc, id)) return
      node[end] = apply(inverse(worldMatrix(draft.doc, id)), point)
    })
  },
  setCrop(crop) { get().commit(draft => { draft.doc.crop = crop }) },
  undo() {
    const { past, present, future } = get()
    if (past.length) set({ present: past[past.length - 1], past: past.slice(0, -1), future: [present, ...future] })
  },
  redo() {
    const { past, present, future } = get()
    if (future.length) set({ present: future[0], past: [...past, present].slice(-100), future: future.slice(1) })
  },
}))
