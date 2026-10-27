import { Circle, Group, Line } from 'react-konva'
import { canvasColors } from '@/lib/canvas-colors'
import type { ImageInfo } from '../model/types'
import type { CanvasGuides } from './CanvasGuideControls'

type Props = {
  image: ImageInfo
  scale: number
  guides: CanvasGuides
}

export function CanvasGuideLayer({ image, scale, guides }: Props) {
  const { width, height } = image
  const x = width / 2, y = height / 2
  const lines: number[][] = []
  if (guides.horizontal) lines.push([0, y, width, y])
  if (guides.vertical) lines.push([x, 0, x, height])
  if (guides.thirds) {
    for (const fraction of [1 / 3, 2 / 3]) {
      lines.push([width * fraction, 0, width * fraction, height])
      lines.push([0, height * fraction, width, height * fraction])
    }
  }
  return <Group listening={false} clipX={0} clipY={0} clipWidth={width} clipHeight={height}>
    {lines.map((points, index) => <Group key={index}>
      <Line points={points} stroke={canvasColors.handle} strokeWidth={3 / scale} dash={[6 / scale, 4 / scale]} opacity={0.9} />
      <Line points={points} stroke={canvasColors.selection} strokeWidth={1 / scale} dash={[6 / scale, 4 / scale]} />
    </Group>)}
    {guides.center && <Group x={x} y={y} scaleX={1 / scale} scaleY={1 / scale}>
      <Circle radius={6} stroke={canvasColors.handle} strokeWidth={4} />
      <Line points={[-11, 0, 11, 0]} stroke={canvasColors.handle} strokeWidth={3} />
      <Line points={[0, -11, 0, 11]} stroke={canvasColors.handle} strokeWidth={3} />
      <Circle radius={6} stroke={canvasColors.selection} strokeWidth={2} />
      <Line points={[-11, 0, 11, 0]} stroke={canvasColors.selection} strokeWidth={1} />
      <Line points={[0, -11, 0, 11]} stroke={canvasColors.selection} strokeWidth={1} />
      <Circle radius={2} fill={canvasColors.selection} />
    </Group>}
  </Group>
}
