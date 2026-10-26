import { inBox, isLocked, selectionBox } from './index'
import type { ImageInfo, Point, Snapshot, SplitAxis } from '../model/types'

export function splitMoveAxis(snapshot: Snapshot, point: Point, scale: number): SplitAxis | null {
  if (snapshot.selected.length !== 1) return null
  const node = snapshot.doc.nodes[snapshot.selected[0]]
  if (node?.type !== 'line' || !node.splitAxis || isLocked(snapshot.doc, node.id)) return null
  const latest = Object.values(snapshot.doc.nodes).reverse().find(candidate => candidate.type === 'line' && candidate.splitAxis)
  if (latest?.id !== node.id) return null
  const box = selectionBox(snapshot.doc, snapshot.selected, scale)
  return box && inBox(point, box) ? node.splitAxis : null
}

export function splitLineAt(point: Point, axis: SplitAxis, image: ImageInfo) {
  const horizontal = axis === 'horizontal'
  const position = Math.round(horizontal ? point.y : point.x)
  return {
    start: horizontal ? { x: 0, y: position } : { x: position, y: 0 },
    end: horizontal ? { x: image.width, y: position } : { x: position, y: image.height },
  }
}
