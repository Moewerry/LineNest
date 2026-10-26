import { Circle, Line, Rect } from 'react-konva'
import { apply, bounds, containsLocked, worldMatrix } from '../geometry'
import type { Box, Point, Snapshot } from '../model/types'
export function SelectionLayer({ snapshot, scale, delta, marquee, endpoint }: { snapshot: Snapshot; scale: number; delta: Point; marquee: Box | null; endpoint: { id: string; end: 'start' | 'end'; point: Point } | null }) {
  const box = bounds(snapshot.doc, snapshot.selected)
  const node = snapshot.selected.length === 1 ? snapshot.doc.nodes[snapshot.selected[0]] : null
  return <>
    {box && <Rect x={box.x + delta.x - 5 / scale} y={box.y + delta.y - 5 / scale} width={box.width + 10 / scale} height={box.height + 10 / scale} stroke="#237a60" strokeWidth={1 / scale} dash={[4 / scale, 3 / scale]} listening={false} />}
    {box && snapshot.selected.every(id => !containsLocked(snapshot.doc, id)) && <>
      <Line points={[box.x + box.width / 2, box.y - 5 / scale, box.x + box.width / 2, box.y - 28 / scale]} x={delta.x} y={delta.y} stroke="#237a60" strokeWidth={1 / scale} listening={false} />
      <Circle id="rotate-handle" x={box.x + box.width / 2 + delta.x} y={box.y - 28 / scale + delta.y} radius={5 / scale} fill="#a7e8cd" stroke="#237a60" strokeWidth={1.5 / scale} hitStrokeWidth={12 / scale} />
    </>}
    {node?.type === 'line' && !containsLocked(snapshot.doc, node.id) && (['start', 'end'] as const).map(end => {
      const p = endpoint?.id === node.id && endpoint.end === end ? endpoint.point : apply(worldMatrix(snapshot.doc, node.id), node[end])
      return <Circle key={end} id={`endpoint:${end}:${node.id}`} x={p.x + delta.x} y={p.y + delta.y} radius={4.5 / scale} fill="white" stroke="#237a60" strokeWidth={1.5 / scale} hitStrokeWidth={10 / scale} />
    })}
    {marquee && <Rect {...marquee} stroke="#237a60" fill="#a7e8cd33" strokeWidth={1 / scale} listening={false} />}
  </>
}
