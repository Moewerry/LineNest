import { useEffect, useRef, useState } from 'react'
import { Separator } from '@/components/ui/separator'

export function SidebarResizeHandle({ width, minWidth, maxWidth, onWidthChange, controls }: {
  width: number
  minWidth: number
  maxWidth: number
  onWidthChange: (width: number) => void
  controls: string
}) {
  const drag = useRef<{ pointerId: number; x: number; width: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const resize = (next: number) => onWidthChange(Math.min(maxWidth, Math.max(minWidth, next)))

  useEffect(() => {
    if (!dragging) return
    const { cursor, userSelect } = document.body.style
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.cursor = cursor
      document.body.style.userSelect = userSelect
    }
  }, [dragging])

  return <Separator
    orientation="vertical"
    decorative={false}
    tabIndex={0}
    aria-label="调整侧边栏宽度"
    aria-controls={controls}
    aria-valuemin={minWidth}
    aria-valuemax={maxWidth}
    aria-valuenow={Math.round(width)}
    aria-valuetext={`${Math.round(width)} 像素`}
    className="absolute inset-y-0 -left-1 z-20 cursor-col-resize touch-none bg-transparent outline-none before:absolute before:inset-y-0 before:left-1/2 before:w-px hover:before:bg-primary focus-visible:before:bg-ring data-[orientation=vertical]:w-2"
    onPointerDown={event => {
      if (event.button !== 0 || !event.isPrimary) return
      event.preventDefault()
      event.currentTarget.focus()
      event.currentTarget.setPointerCapture(event.pointerId)
      drag.current = { pointerId: event.pointerId, x: event.clientX, width }
      setDragging(true)
    }}
    onPointerMove={event => {
      if (drag.current?.pointerId === event.pointerId) resize(drag.current.width + drag.current.x - event.clientX)
    }}
    onPointerUp={event => {
      if (drag.current?.pointerId !== event.pointerId) return
      drag.current = null
      setDragging(false)
      event.currentTarget.releasePointerCapture(event.pointerId)
    }}
    onPointerCancel={() => { drag.current = null; setDragging(false) }}
    onLostPointerCapture={() => { drag.current = null; setDragging(false) }}
    onDoubleClick={() => resize(320)}
    onKeyDown={event => {
      const step = event.shiftKey ? 40 : 10
      const next = event.key === 'ArrowLeft' ? width + step : event.key === 'ArrowRight' ? width - step : event.key === 'Home' ? minWidth : event.key === 'End' ? maxWidth : null
      if (next === null) return
      event.preventDefault()
      event.stopPropagation()
      resize(next)
    }}
  />
}
