import { create } from 'zustand'
import { apply, childrenOf, containsLocked, containsSplit, identity, inverse, isLocked, multiply, normalizeSplitLines, segments, translation, worldMatrix } from '../geometry'
import { emptySnapshot, type Box, type ImageInfo, type Matrix, type Point, type Snapshot, type SplitAxis, type Tool } from './types'
import { rotateDocumentClockwise } from '../geometry/rotate-document'
import { containsPoint, ringsKey } from '@/features/fill/geometry'
import { MAX_MARK_POINTS, MAX_REGION_MARKS } from '@/features/fill/constants'

type EditorState = {
  present: Snapshot; past: Snapshot[]; future: Snapshot[]; tool: Tool
  fillColor: string; fillOpacity: number; fillAction: 'mark' | 'erase'
  commit: (change: (draft: Snapshot) => void) => void
  setTool: (tool: Tool) => void
  setImage: (image: ImageInfo) => void
  removeImage: () => void
  rotateImage: (image: ImageInfo) => void
  setFillColor: (color: string) => void
  setFillOpacity: (opacity: number) => void
  setFillAction: (action: 'mark' | 'erase') => void
  markRegion: (rings: Point[][], label: Point) => void
  eraseRegionMark: (point: Point) => void
  select: (ids: string[]) => void
  addLine: (start: Point, end: Point, splitAxis?: SplitAxis) => void
  clearLines: () => void
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
  fillColor: '#bd3e1c', fillOpacity: 0.35, fillAction: 'mark',
  commit(change) {
    const current = get().present, next = structuredClone(current)
    change(next)
    if (JSON.stringify(current) === JSON.stringify(next)) return
    set(state => ({ present: next, past: [...state.past, current].slice(-100), future: [] }))
  },
  setTool: tool => set({ tool }),
  setImage(image) {
    if (!get().present.doc.image) {
      set({ present: { ...emptySnapshot(), doc: { ...emptySnapshot().doc, image } }, past: [], future: [], tool: 'split' })
      return
    }
    get().commit(draft => Object.assign(draft, emptySnapshot(), { doc: { ...emptySnapshot().doc, image } }))
    set({ tool: 'split' })
  },
  rotateImage(image) { get().commit(draft => rotateDocumentClockwise(draft.doc, image)) },
  removeImage() { get().commit(draft => Object.assign(draft, emptySnapshot())) },
  setFillColor(color) { if (/^#[0-9a-f]{6}$/i.test(color)) set({ fillColor: color.toLowerCase() }) },
  setFillOpacity(opacity) { if (Number.isFinite(opacity)) set({ fillOpacity: Math.max(0, Math.min(1, opacity)) }) },
  setFillAction: fillAction => set({ fillAction }),
  markRegion(rings, label) {
    const { fillColor: color, fillOpacity: opacity } = get()
    get().commit(draft => {
      if (!draft.doc.image) return
      const marks = draft.doc.marks ?? [], key = ringsKey(rings)
      const index = marks.findIndex(mark => ringsKey(mark.rings) === key)
      if (index >= 0 && index === marks.length - 1 && marks[index].color === color && marks[index].opacity === opacity) return
      const retained = marks.filter((_, current) => current !== index)
      if (retained.length >= MAX_REGION_MARKS) throw new Error(`最多标记 ${MAX_REGION_MARKS} 个裁切区域`)
      const vertices = [...retained.map(mark => mark.rings), rings].reduce((sum, value) => sum + value.reduce((count, ring) => count + ring.length, 0), 0)
      if (vertices > MAX_MARK_POINTS) throw new Error('区域轮廓过于复杂，请减少标记后重试')
      draft.doc.marks = [...retained, { id: index >= 0 ? marks[index].id : crypto.randomUUID(), rings: structuredClone(rings), label: { ...label }, color, opacity }]
    })
  },
  eraseRegionMark(point) {
    get().commit(draft => {
      const marks = draft.doc.marks ?? []
      let index = marks.length - 1
      while (index >= 0 && !containsPoint(marks[index].rings, point)) index--
      if (index >= 0) draft.doc.marks = marks.filter((_, current) => current !== index)
    })
  },
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
  clearLines() {
    get().commit(draft => {
      if (!Object.values(draft.doc.nodes).some(node => node.type === 'line')) return
      draft.doc.nodes = {}
      draft.doc.roots = []
      draft.selected = []
      draft.scope = null
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
