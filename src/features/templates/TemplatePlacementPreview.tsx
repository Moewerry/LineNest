import { useMemo } from 'react'
import { Group, Line, Rect } from 'react-konva'
import { segments } from '@/features/editor/geometry'
import { canvasColors } from '@/lib/canvas-colors'
import { templateDocument } from './layout'
import type { TemplatePlacement } from './placement'

export function TemplatePlacementPreview({ placement, viewScale }: { placement: TemplatePlacement; viewScale: number }) {
  const lines = useMemo(() => segments(templateDocument(placement.layout)), [placement.layout])
  if (!placement.center) return null
  const box = placement.bounds, scale = placement.scale * viewScale
  return <Group x={placement.center.x} y={placement.center.y} scaleX={placement.scale} scaleY={placement.scale}
    offsetX={box.x + box.width / 2} offsetY={box.y + box.height / 2} listening={false} opacity={0.8}>
    <Rect {...box} fill={canvasColors.cropFill} stroke={canvasColors.selection} strokeWidth={1 / scale} dash={[5 / scale, 4 / scale]} />
    {lines.map(line => <Line key={line.id} points={[line.start.x, line.start.y, line.end.x, line.end.y]} stroke={canvasColors.selection} strokeWidth={2 / scale} lineCap="round" />)}
  </Group>
}
