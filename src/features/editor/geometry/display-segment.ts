import type { Box, SplitAxis } from '../model/types'
import type { Segment } from './index'

// Extend only the visual guide; document endpoints remain at the image boundary.
export function displaySegment(segment: Segment, axis: SplitAxis | undefined, viewport: Box): Segment {
  if (axis === 'horizontal') {
    const y = (segment.start.y + segment.end.y) / 2
    return { id: segment.id, start: { x: viewport.x, y }, end: { x: viewport.x + viewport.width, y } }
  }
  if (axis === 'vertical') {
    const x = (segment.start.x + segment.end.x) / 2
    return { id: segment.id, start: { x, y: viewport.y }, end: { x, y: viewport.y + viewport.height } }
  }
  return segment
}
