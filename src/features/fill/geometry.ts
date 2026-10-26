import { apply } from '@/features/editor/geometry'
import type { Matrix, Point } from '@/features/editor/model/types'

const precision = 1_000_000
const boundaryTolerance = 1e-7
type Vertex = [number, number]

const compare = (a: Vertex, b: Vertex) => a[0] - b[0] || a[1] - b[1]

// Find the lexicographically smallest cyclic traversal without trying every rotation.
function leastRotation(points: Vertex[]): number {
  const count = points.length
  let first = 0, second = 1, offset = 0
  while (first < count && second < count && offset < count) {
    const order = compare(points[(first + offset) % count], points[(second + offset) % count])
    if (order === 0) { offset++; continue }
    if (order > 0) {
      first += offset + 1
      if (first <= second) first = second + 1
    } else {
      second += offset + 1
      if (second <= first) second = first + 1
    }
    offset = 0
  }
  return Math.min(first, second)
}

function ringKey(ring: Point[]): string {
  const points: Vertex[] = []
  for (const point of ring) {
    const vertex: Vertex = [Math.round(point.x * precision), Math.round(point.y * precision)]
    if (!points.length || compare(points[points.length - 1], vertex) !== 0) points.push(vertex)
  }
  while (points.length > 1 && compare(points[0], points[points.length - 1]) === 0) points.pop()
  if (!points.length) return ''
  const reversed = [...points].reverse()
  const forwardStart = leastRotation(points), reverseStart = leastRotation(reversed)
  let traversal = points, start = forwardStart
  for (let offset = 0; offset < points.length; offset++) {
    const order = compare(points[(forwardStart + offset) % points.length], reversed[(reverseStart + offset) % points.length])
    if (order < 0) break
    if (order > 0) { traversal = reversed; start = reverseStart; break }
  }
  return Array.from({ length: points.length }, (_, offset) => traversal[(start + offset) % points.length].join(',')).join(';')
}

export function ringsKey(rings: Point[][]): string {
  if (!rings.length) return '[]'
  return JSON.stringify([ringKey(rings[0]), ...rings.slice(1).map(ringKey).sort()])
}

export function containsPoint(rings: Point[][], point: Point): boolean {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return false
  let inside = false
  for (const ring of rings) {
    if (ring.length < 3) continue
    for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
      const a = ring[previous], b = ring[index]
      const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy)
      if (length === 0) {
        if (Math.hypot(point.x - a.x, point.y - a.y) <= boundaryTolerance) return false
        continue
      }
      const withinBounds = point.x >= Math.min(a.x, b.x) - boundaryTolerance && point.x <= Math.max(a.x, b.x) + boundaryTolerance
        && point.y >= Math.min(a.y, b.y) - boundaryTolerance && point.y <= Math.max(a.y, b.y) + boundaryTolerance
      if (withinBounds && Math.abs(dx * (point.y - a.y) - dy * (point.x - a.x)) <= boundaryTolerance * length) return false
      if ((a.y > point.y) !== (b.y > point.y) && point.x < a.x + (point.y - a.y) * dx / dy) inside = !inside
    }
  }
  return inside
}

export function transformRings(rings: Point[][], matrix: Matrix): Point[][] {
  return rings.map(ring => ring.map(point => apply(matrix, point)))
}
