import type { Box, DocumentData, Matrix, Point } from '../model/types'

export const identity = (): Matrix => [1, 0, 0, 1, 0, 0]
export const translation = (x: number, y: number): Matrix => [1, 0, 0, 1, x, y]
export function rotationAround(center: Point, degrees: number): Matrix {
  const angle = degrees * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle)
  return multiply(multiply(translation(center.x, center.y), [c, s, -s, c, 0, 0]), translation(-center.x, -center.y))
}
export function multiply(a: Matrix, b: Matrix): Matrix {
  return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]]
}
export function inverse(m: Matrix): Matrix {
  const d = m[0] * m[3] - m[1] * m[2]
  return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d,
    (m[2] * m[5] - m[3] * m[4]) / d, (m[1] * m[4] - m[0] * m[5]) / d]
}
export const apply = (m: Matrix, p: Point): Point => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] })
export function worldMatrix(doc: DocumentData, id: string | null): Matrix {
  if (!id) return identity()
  const node = doc.nodes[id]
  return multiply(worldMatrix(doc, node.parentId), node.matrix)
}
export function childrenOf(doc: DocumentData, scope: string | null): string[] {
  const node = scope ? doc.nodes[scope] : null
  return node?.type === 'group' ? node.children : doc.roots
}
export function isLocked(doc: DocumentData, id: string): boolean {
  const node = doc.nodes[id]
  if (!node) return true
  return node.locked || (node.parentId !== null && isLocked(doc, node.parentId))
}
export function containsLocked(doc: DocumentData, id: string): boolean {
  const node = doc.nodes[id]
  return isLocked(doc, id) || (node.type === 'group' && node.children.some(child => containsLocked(doc, child)))
}
export function scopeTarget(doc: DocumentData, id: string, scope: string | null): string | null {
  let node = doc.nodes[id]
  while (node && node.parentId !== scope) {
    if (!node.parentId) return null
    node = doc.nodes[node.parentId]
  }
  return node?.id ?? null
}
export type Segment = { id: string; start: Point; end: Point }
export function segments(doc: DocumentData, ids = doc.roots): Segment[] {
  return ids.flatMap(id => {
    const node = doc.nodes[id]
    if (node.type === 'group') return segments(doc, node.children)
    const m = worldMatrix(doc, id)
    return [{ id, start: apply(m, node.start), end: apply(m, node.end) }]
  })
}
export function containsSplit(doc: DocumentData, ids: string[]): boolean {
  return segments(doc, ids).some(segment => {
    const node = doc.nodes[segment.id]
    return node.type === 'line' && !!node.splitAxis
  })
}

// Store full-image endpoints in local coordinates, including inside groups.
export function normalizeSplitLines(doc: DocumentData) {
  const image = doc.image
  if (!image) return
  for (const segment of segments(doc)) {
    const node = doc.nodes[segment.id]
    if (node.type !== 'line' || !node.splitAxis) continue
    const horizontal = node.splitAxis === 'horizontal'
    const coordinate = horizontal ? (segment.start.y + segment.end.y) / 2 : (segment.start.x + segment.end.x) / 2
    const position = Math.round(coordinate)
    const parent = inverse(worldMatrix(doc, node.parentId))
    node.matrix = identity()
    node.start = apply(parent, horizontal ? { x: 0, y: position } : { x: position, y: 0 })
    node.end = apply(parent, horizontal ? { x: image.width, y: position } : { x: position, y: image.height })
  }
}
export function bounds(doc: DocumentData, ids: string[]): Box | null {
  const points = segments(doc, ids).flatMap(s => [s.start, s.end])
  if (!points.length) return null
  const x = Math.min(...points.map(p => p.x)), y = Math.min(...points.map(p => p.y))
  return { x, y, width: Math.max(...points.map(p => p.x)) - x, height: Math.max(...points.map(p => p.y)) - y }
}
export function boxBetween(a: Point, b: Point): Box {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }
}
export const inBox = (p: Point, b: Box) => p.x >= b.x && p.y >= b.y && p.x <= b.x + b.width && p.y <= b.y + b.height
// Liang–Barsky clipping tests the segment instead of its bounding box.
export function segmentIntersectsBox(a: Point, b: Point, box: Box): boolean {
  let min = 0, max = 1
  const dx = b.x - a.x, dy = b.y - a.y
  const p = [-dx, dx, -dy, dy]
  const q = [a.x - box.x, box.x + box.width - a.x, a.y - box.y, box.y + box.height - a.y]
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; continue }
    const r = q[i] / p[i]
    if (p[i] < 0) min = Math.max(min, r)
    else max = Math.min(max, r)
    if (min > max) return false
  }
  return true
}
