import type { ImageInfo } from '../model/types'

export const RULER_SIZE = 24

type Props = {
  image: ImageInfo
  view: { x: number; y: number; scale: number }
  size: { width: number; height: number }
}

function ticks(origin: number, scale: number, length: number, extent: number) {
  // Keep major labels at least 64 screen pixels apart at every zoom level.
  const minimum = 64 / scale
  const magnitude = 10 ** Math.floor(Math.log10(minimum))
  const major = [1, 2, 5, 10].map(value => value * magnitude).find(value => value >= minimum)!
  const step = major / 5
  const first = Math.max(0, Math.ceil((RULER_SIZE - origin) / scale / step))
  const last = Math.min(Math.floor(extent / step), Math.floor((length - origin) / scale / step))
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, index) => {
    const tick = first + index
    return { position: origin + tick * step * scale, label: Number((tick * step).toFixed(2)), major: tick % 5 === 0 }
  })
}

export function CanvasRulers({ image, view, size }: Props) {
  const horizontal = ticks(view.x, view.scale, size.width, image.width)
  const vertical = ticks(view.y, view.scale, size.height, image.height)
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-muted-foreground">
    <svg className="absolute left-0 top-0 border-b bg-card" width={size.width} height={RULER_SIZE}>
      {horizontal.map(tick => <g key={tick.label}>
        <line x1={tick.position} x2={tick.position} y1={tick.major ? 15 : 20} y2={RULER_SIZE} stroke="currentColor" />
        {tick.major && <text x={tick.position + 3} y={11} fill="currentColor" fontSize={9}>{tick.label}</text>}
      </g>)}
    </svg>
    <svg className="absolute left-0 top-6 border-r bg-card" width={RULER_SIZE} height={Math.max(0, size.height - RULER_SIZE)}>
      {vertical.map(tick => <g key={tick.label} transform={`translate(0 ${tick.position - RULER_SIZE})`}>
        <line x1={tick.major ? 15 : 20} x2={RULER_SIZE} y1={0} y2={0} stroke="currentColor" />
        {tick.major && <text transform="translate(11 -3) rotate(-90)" fill="currentColor" fontSize={9}>{tick.label}</text>}
      </g>)}
    </svg>
    <span className="absolute left-0 top-0 flex size-6 items-center justify-center border-b border-r bg-card text-[9px]">px</span>
  </div>
}
