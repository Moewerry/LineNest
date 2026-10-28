import { containsPoint } from '@/features/fill/geometry'
import { childrenOf, isLocked, segments } from './index'
import { displaySegment } from './display-segment'
import type { Box, Point, Snapshot } from '../model/types'

function pointDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x, dy = b.y - a.y
  const t = dx || dy ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy))) : 0
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy)
}

function touches(a: Point, b: Point, c: Point, d: Point, radius: number): boolean {
  const cross = (p: Point, q: Point, r: Point) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)
  if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return true
  return Math.min(pointDistance(a, c, d), pointDistance(b, c, d), pointDistance(c, a, b), pointDistance(d, a, b)) <= radius
}

function touchesRing(a: Point, b: Point, ring: Point[], radius: number): boolean {
  return ring.some((point, index) => touches(a, b, point, ring[(index + 1) % ring.length], radius))
}

// Mutate only the gesture preview; commit the entire stroke when the pointer is released.
export function eraseStroke(draft: Snapshot, start: Point, end: Point, scale: number, viewport: Box) {
  const { doc } = draft, image = doc.image
  if (!image) return
  const radius = 8 / scale, imageBox = { x: 0, y: 0, width: image.width, height: image.height }
  const affectedGroups = new Set<string>()
  for (const segment of segments(doc)) {
    const node = doc.nodes[segment.id]
    if (node.type !== 'line' || isLocked(doc, node.id)) continue
    const display = displaySegment(segment, node.splitAxis, viewport)
    if (!touches(start, end, display.start, display.end, radius)) continue
    // Free lines are clipped to the image, unlike full-viewport split guides.
    if (!node.splitAxis) {
      const clipped = clipToImage(segment.start, segment.end, imageBox)
      if (!clipped || !touches(start, end, clipped[0], clipped[1], radius)) continue
    }
    const siblings = childrenOf(doc, node.parentId)
    let parentId = node.parentId
    while (parentId) {
      affectedGroups.add(parentId)
      parentId = doc.nodes[parentId].parentId
    }
    siblings.splice(siblings.indexOf(node.id), 1)
    delete doc.nodes[node.id]
  }
  const prune = (ids: string[]) => {
    for (const id of [...ids]) {
      const node = doc.nodes[id]
      if (node.type !== 'group') continue
      prune(node.children)
      if (affectedGroups.has(id) && !node.children.length && !doc.marks?.some(mark => mark.groupId === id) && !isLocked(doc, id)) {
        ids.splice(ids.indexOf(id), 1)
        delete doc.nodes[id]
      }
    }
  }
  const clippedStroke = clipToImage(start, end, imageBox)
  if (clippedStroke && doc.marks?.length) {
    const [a, b] = clippedStroke
    doc.marks = doc.marks.filter(mark => {
      if (mark.groupId && isLocked(doc, mark.groupId)) return true
      const erased = containsPoint(mark.rings, a) || containsPoint(mark.rings, b) || mark.rings.some(ring => touchesRing(a, b, ring, radius))
      if (erased) {
        let groupId = mark.groupId
        while (groupId) {
          affectedGroups.add(groupId)
          groupId = doc.nodes[groupId].parentId ?? undefined
        }
      }
      return !erased
    })
  }
  prune(doc.roots)
  draft.selected = draft.selected.filter(id => !!doc.nodes[id])
  if (draft.scope && !doc.nodes[draft.scope]) draft.scope = null
  if (doc.crop) {
    const { x, y, width, height } = doc.crop
    const ring = [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }]
    if (touchesRing(start, end, ring, radius)) doc.crop = null
  }
}

function clipToImage(a: Point, b: Point, box: Box): [Point, Point] | null {
  let min = 0, max = 1
  const dx = b.x - a.x, dy = b.y - a.y
  const p = [-dx, dx, -dy, dy], q = [a.x - box.x, box.x + box.width - a.x, a.y - box.y, box.y + box.height - a.y]
  for (let index = 0; index < 4; index++) {
    if (p[index] === 0) { if (q[index] < 0) return null; continue }
    const ratio = q[index] / p[index]
    if (p[index] < 0) min = Math.max(min, ratio)
    else max = Math.min(max, ratio)
    if (min > max) return null
  }
  return [{ x: a.x + min * dx, y: a.y + min * dy }, { x: a.x + max * dx, y: a.y + max * dy }]
}
