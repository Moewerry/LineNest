import { Rect } from 'react-konva'
import { canvasColors } from '@/lib/canvas-colors'
import { resizeHandlesForBox } from '../geometry/resize-selection'
import type { Box, Point } from '../model/types'

export function SelectionResizeHandles({ box, outline, scale, delta }: { box: Box; outline: Box; scale: number; delta: Point }) {
  const size = 8 / scale
  return <>{resizeHandlesForBox(box).map(handle => <Rect key={handle.name} id={`resize:${handle.name}`}
    x={outline.x + (handle.x + 1) * outline.width / 2 + delta.x - size / 2}
    y={outline.y + (handle.y + 1) * outline.height / 2 + delta.y - size / 2}
    width={size} height={size} fill={canvasColors.handle} stroke={canvasColors.selection}
    strokeWidth={1.5 / scale} hitStrokeWidth={10 / scale} />)}</>
}
