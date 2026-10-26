import { Group, Line } from 'react-konva'
import { canvasColors } from '@/lib/canvas-colors'
import { isLocked, scopeTarget, segments } from '../geometry'
import { displaySegment } from '../geometry/display-segment'
import type { Box, Point, Snapshot } from '../model/types'
export function NodeLayer({ snapshot, scale, delta, endpoint, viewport }: { snapshot: Snapshot; scale: number; delta: Point; endpoint: { id: string; end: 'start' | 'end'; point: Point } | null; viewport: Box }) {
  const { doc, selected, scope } = snapshot
  if (!doc.image) return null
  const image = doc.image
  return <>{segments(doc).map(segment => {
    if (endpoint?.id === segment.id) segment[endpoint.end] = endpoint.point
    const target = scopeTarget(doc, segment.id, scope), active = !!target && selected.includes(target)
    const shift = active ? delta : { x: 0, y: 0 }
    const node = doc.nodes[segment.id], axis = node.type === 'line' ? node.splitAxis : undefined
    const display = displaySegment({ id: segment.id, start: { x: segment.start.x + shift.x, y: segment.start.y + shift.y }, end: { x: segment.end.x + shift.x, y: segment.end.y + shift.y } }, axis, viewport)
    return <Group key={segment.id} {...(!axis ? { clipX: 0, clipY: 0, clipWidth: image.width, clipHeight: image.height } : {})}>
      <Line id={segment.id} points={[display.start.x, display.start.y, display.end.x, display.end.y]} stroke={active ? canvasColors.selection : canvasColors.line} strokeWidth={(active ? 2 : 1.5) / scale} hitStrokeWidth={14 / scale} opacity={isLocked(doc, segment.id) ? 0.4 : target ? 1 : 0.3} lineCap="round" />
    </Group>
  })}</>
}
