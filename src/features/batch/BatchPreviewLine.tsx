import { useRef, type PointerEvent } from 'react'
import type { Segment } from '@/features/editor/geometry'
import type { Point } from '@/features/editor/model/types'

export function BatchPreviewLine({ line, offset, disabled, onMove }: {
  line: Segment; offset: Point; disabled: boolean; onMove: (offset: Point) => void
}) {
  const drag = useRef<{ pointerId: number; start: Point; offset: Point } | null>(null)
  const horizontal = Math.abs(line.end.y - line.start.y) < 1e-7
  const vertical = Math.abs(line.end.x - line.start.x) < 1e-7
  const point = (event: PointerEvent<SVGLineElement>): Point | null => {
    const matrix = event.currentTarget.ownerSVGElement?.getScreenCTM()
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null
  }
  const move = (event: PointerEvent<SVGLineElement>) => {
    const current = drag.current
    if (disabled || !current || current.pointerId !== event.pointerId) return
    const next = point(event)
    if (next) onMove({ x: current.offset.x + (horizontal ? 0 : next.x - current.start.x), y: current.offset.y + (vertical ? 0 : next.y - current.start.y) })
  }
  return <g>
    <line x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke="var(--primary)" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
    <line x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke="transparent" strokeWidth={16} vectorEffect="non-scaling-stroke"
      className={disabled ? 'pointer-events-none' : horizontal ? 'touch-none cursor-ns-resize' : vertical ? 'touch-none cursor-ew-resize' : 'touch-none cursor-move'}
      onPointerDown={event => {
        if (disabled || event.button !== 0 || drag.current) return
        const start = point(event)
        if (!start) return
        event.preventDefault(); event.stopPropagation()
        drag.current = { pointerId: event.pointerId, start, offset: { ...offset } }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={move}
      onPointerUp={event => {
        if (drag.current?.pointerId !== event.pointerId) return
        move(event)
        drag.current = null
        event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={event => {
        if (drag.current?.pointerId !== event.pointerId) return
        if (!disabled) onMove(drag.current.offset)
        drag.current = null
      }}
      onLostPointerCapture={() => { drag.current = null }}>
      <title>拖动调整线条位置</title>
    </line>
  </g>
}
