import { Group, Shape } from 'react-konva'
import type Konva from 'konva'
import type { RegionMark } from '@/features/editor/model/types'

export function RegionMarkLayer({ marks, scale }: { marks: RegionMark[]; scale: number }) {
  return <>{marks.map(mark => {
    const draw = (context: Konva.Context, shape: Konva.Shape) => {
      context.beginPath()
      for (const ring of mark.rings) {
        if (!ring.length) continue
        context.moveTo(ring[0].x, ring[0].y)
        for (let index = 1; index < ring.length; index++) context.lineTo(ring[index].x, ring[index].y)
        context.closePath()
      }
      context.fillStrokeShape(shape)
    }
    const channels = [1, 3, 5].map(index => parseInt(mark.color.slice(index, index + 2), 16))
    const light = channels[0] * 0.299 + channels[1] * 0.587 + channels[2] * 0.114 > 170
    return <Group key={mark.id} listening={false}>
      <Shape sceneFunc={draw} fillRule="evenodd" fill={mark.color} opacity={mark.opacity} strokeEnabled={false} listening={false} />
      <Shape sceneFunc={draw} fillRule="evenodd" fillEnabled={false} stroke={light ? '#171717' : '#ffffff'} strokeWidth={10 / scale} lineJoin="round" listening={false} />
      <Shape sceneFunc={draw} fillRule="evenodd" fillEnabled={false} stroke={mark.color} strokeWidth={7 / scale} lineJoin="round" listening={false} />
    </Group>
  })}</>
}
