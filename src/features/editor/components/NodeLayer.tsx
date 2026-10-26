import { Line } from 'react-konva'
import { isLocked, scopeTarget, segments } from '../geometry'
import type { Point, Snapshot } from '../model/types'
export function NodeLayer({ snapshot, scale, delta, endpoint }: { snapshot: Snapshot; scale: number; delta: Point; endpoint: { id: string; end: 'start' | 'end'; point: Point } | null }) {
  const { doc, selected, scope } = snapshot
  return <>{segments(doc).map(segment => {
    if (endpoint?.id === segment.id) segment[endpoint.end] = endpoint.point
    const target = scopeTarget(doc, segment.id, scope), active = !!target && selected.includes(target)
    const shift = active ? delta : { x: 0, y: 0 }
    return <Line key={segment.id} id={segment.id} points={[segment.start.x + shift.x, segment.start.y + shift.y, segment.end.x + shift.x, segment.end.y + shift.y]} stroke={active ? '#237a60' : '#3f3f46'} strokeWidth={(active ? 2 : 1.5) / scale} hitStrokeWidth={14 / scale} opacity={isLocked(doc, segment.id) ? 0.4 : target ? 1 : 0.3} lineCap="round" />
  })}</>
}
