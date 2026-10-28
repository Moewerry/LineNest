import type { RegionMark } from '@/features/editor/model/types'
import { screenStrokeWidth } from '@/lib/display-stroke'

export function RegionMarkPreview({ marks, scale = 1 }: { marks: RegionMark[]; scale?: number }) {
  return <g pointerEvents="none">{marks.map(mark => <path key={mark.id}
    d={mark.rings.map(ring => ring.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ') + ' Z').join(' ')}
    fill={mark.color} fillOpacity={mark.opacity} fillRule="evenodd" stroke={mark.color} strokeWidth={screenStrokeWidth(scale, 1)} vectorEffect="non-scaling-stroke" />)}</g>
}
