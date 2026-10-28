import { Circle, Line, Rect } from 'react-konva'
import { canvasColors } from '@/lib/canvas-colors'
import { apply, bounds, containsLocked, containsSplit, selectionBox, worldMatrix } from '../geometry'
import type { Box, Point, Snapshot } from '../model/types'
import { SelectionResizeHandles } from './SelectionResizeHandles'
import { canvasStrokeWidth } from '@/lib/display-stroke'
export function SelectionLayer({ snapshot, scale, delta, marquee, endpoint, interactive }: { snapshot: Snapshot; scale: number; delta: Point; marquee: Box | null; endpoint: { id: string; end: 'start' | 'end'; point: Point } | null; interactive: boolean }) {
  const box = bounds(snapshot.doc, snapshot.selected)
  const outline = selectionBox(snapshot.doc, snapshot.selected, scale)
  const node = snapshot.selected.length === 1 ? snapshot.doc.nodes[snapshot.selected[0]] : null
  const editable = snapshot.selected.every(id => !containsLocked(snapshot.doc, id))
  const transformable = editable && !containsSplit(snapshot.doc, snapshot.selected)
  const grouped = node?.type === 'group' || snapshot.selected.length > 1
  const resizable = transformable && grouped
  return <>
    {outline && <Rect id="selection-move" {...outline} x={outline.x + delta.x} y={outline.y + delta.y} fillEnabled={false} stroke={canvasColors.selection} strokeWidth={canvasStrokeWidth(scale, 1)} dash={[4 / scale, 3 / scale]} hitStrokeWidth={6 / scale} listening={interactive && editable && grouped} />}
    {box && transformable && <>
      <Line points={[box.x + box.width / 2, box.y - 5 / scale, box.x + box.width / 2, box.y - 28 / scale]} x={delta.x} y={delta.y} stroke={canvasColors.selection} strokeWidth={canvasStrokeWidth(scale, 1)} listening={false} />
      <Circle id="rotate-handle" x={box.x + box.width / 2 + delta.x} y={box.y - 28 / scale + delta.y} radius={5 / scale} fill={canvasColors.handle} stroke={canvasColors.selection} strokeWidth={1.5 / scale} hitStrokeWidth={12 / scale} listening={interactive} />
    </>}
    {box && outline && resizable && interactive && <SelectionResizeHandles box={box} outline={outline} scale={scale} delta={delta} />}
    {node?.type === 'line' && !node.splitAxis && !containsLocked(snapshot.doc, node.id) && (['start', 'end'] as const).map(end => {
      const p = endpoint?.id === node.id && endpoint.end === end ? endpoint.point : apply(worldMatrix(snapshot.doc, node.id), node[end])
      return <Circle key={end} id={`endpoint:${end}:${node.id}`} x={p.x + delta.x} y={p.y + delta.y} radius={4.5 / scale} fill={canvasColors.handle} stroke={canvasColors.selection} strokeWidth={1.5 / scale} hitStrokeWidth={10 / scale} listening={interactive} />
    })}
    {marquee && <Rect {...marquee} stroke={canvasColors.selection} fill={canvasColors.selectionFill} strokeWidth={canvasStrokeWidth(scale, 1)} listening={false} />}
  </>
}
