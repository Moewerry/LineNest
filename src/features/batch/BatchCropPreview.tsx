import type { Box } from '@/features/editor/model/types'

export function BatchCropPreview({ crop, width, height }: { crop: Box; width: number; height: number }) {
  const { x, y, width: size, height: cropHeight } = crop
  const outside = `M0 0H${width}V${height}H0Z M${x} ${y}H${x + size}V${y + cropHeight}H${x}Z`
  return <g pointerEvents="none">
    <path d={outside} fill="black" fillOpacity={0.3} fillRule="evenodd" />
    <rect x={x} y={y} width={size} height={cropHeight} fill="none" stroke="var(--primary)" strokeWidth={2} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
  </g>
}
