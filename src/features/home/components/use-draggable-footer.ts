import { useEffect, useRef, useState, type PointerEvent } from 'react'

type Position = { x: number; y: number }
type Drag = { pointerId: number; start: Position; origin: Position; moved: boolean }

const margin = 8

export function useDraggableFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const drag = useRef<Drag | null>(null)
  const suppressClick = useRef(false)
  const [position, setPosition] = useState<Position | null>(null)
  const [dragging, setDragging] = useState(false)

  const constrain = (next: Position) => {
    const bounds = footerRef.current?.getBoundingClientRect()
    return {
      x: Math.max(margin, Math.min(next.x, window.innerWidth - (bounds?.width ?? 40) - margin)),
      y: Math.max(margin, Math.min(next.y, window.innerHeight - (bounds?.height ?? 40) - margin)),
    }
  }

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return
    // Keep the expanded link and dragged position inside the viewport after resizing.
    const adjust = () => setPosition(current => {
      if (!current) return current
      const next = constrain(current)
      return next.x === current.x && next.y === current.y ? current : next
    })
    const observer = new ResizeObserver(adjust)
    observer.observe(footer)
    window.addEventListener('resize', adjust)
    return () => { observer.disconnect(); window.removeEventListener('resize', adjust) }
  }, [])

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) return
    const bounds = footerRef.current?.getBoundingClientRect()
    if (!bounds) return
    suppressClick.current = false
    drag.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: { x: bounds.left, y: bounds.top },
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    const dx = event.clientX - current.start.x, dy = event.clientY - current.start.y
    if (!current.moved && Math.hypot(dx, dy) < 6) return
    current.moved = true
    suppressClick.current = true
    setDragging(true)
    setPosition(constrain({ x: current.origin.x + dx, y: current.origin.y + dy }))
  }

  const finish = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return
    drag.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return {
    footerRef,
    dragging,
    style: position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined,
    shouldSuppressClick: () => suppressClick.current,
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish, onLostPointerCapture: finish },
  }
}
