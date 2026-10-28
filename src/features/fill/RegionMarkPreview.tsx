import type { RegionMark } from '@/features/editor/model/types'

export function RegionMarkPreview({ marks }: { marks: RegionMark[] }) {
  return <g pointerEvents="none">{marks.map(mark => <path key={mark.id}
    d={mark.rings.map(ring => ring.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ') + ' Z').join(' ')}
    fill={mark.color} fillOpacity={mark.opacity} fillRule="evenodd" stroke={mark.color} strokeWidth={1} vectorEffect="non-scaling-stroke" />)}</g>
}
