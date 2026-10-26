import { Line } from 'react-konva'
import { canvasColors } from '@/lib/canvas-colors'
import { displaySegment } from '../geometry/display-segment'
import { splitLineAt } from '../geometry/split-line'
import type { Box, ImageInfo, Point, SplitAxis } from '../model/types'

export function SplitLinePreview({ point, axis, image, viewport, scale }: { point: Point; axis: SplitAxis; image: ImageInfo; viewport: Box; scale: number }) {
  const segment = displaySegment({ id: 'split-preview', ...splitLineAt(point, axis, image) }, axis, viewport)
  const points = [segment.start.x, segment.start.y, segment.end.x, segment.end.y]
  return <Line points={points} stroke={canvasColors.selection} strokeWidth={2 / scale} listening={false} />
}
