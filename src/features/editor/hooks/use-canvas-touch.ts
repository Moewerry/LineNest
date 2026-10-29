import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type SetStateAction, type Dispatch } from 'react'
import type { Point } from '../model/types'

type View = Point & { scale: number }

export function useCanvasTouch({ enabled, setView, onCancel }: { enabled: boolean; setView: Dispatch<SetStateAction<View>>; onCancel: () => void }) {
  const pointers = useRef(new Map<number, Point>())
  const blocked = useRef(false)
  const previous = useRef<{ center: Point; distance: number } | null>(null)
  const pending = useRef<(() => void) | null>(null)
  const [active, setActive] = useState(false)
  const reset = () => {
    pointers.current.clear()
    blocked.current = false
    previous.current = null
    pending.current = null
    setActive(false)
  }
  useEffect(() => {
    reset()
    window.addEventListener('blur', reset)
    return () => window.removeEventListener('blur', reset)
  }, [enabled])
  const pair = () => {
    const [a, b] = [...pointers.current.values()]
    return a && b ? { center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, distance: Math.hypot(b.x - a.x, b.y - a.y) } : null
  }
  const screen = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }
  const suppress = (event: ReactPointerEvent<HTMLDivElement>) => { event.preventDefault(); event.stopPropagation() }
  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType !== 'touch' || !(event.target instanceof HTMLCanvasElement)) return
    pointers.current.set(event.pointerId, screen(event))
    event.target.setPointerCapture(event.pointerId)
    if (pointers.current.size >= 2) {
      blocked.current = true
      pending.current = null
      previous.current = pair()
      setActive(true)
      onCancel()
    }
    if (blocked.current) suppress(event)
  }
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return false
    pointers.current.set(event.pointerId, screen(event))
    if (!blocked.current) return false
    suppress(event)
    const next = pair(), last = previous.current
    if (next && last) {
      setView(view => {
        const scale = Math.min(8, Math.max(0.01, view.scale * (last.distance > 0 ? next.distance / last.distance : 1)))
        const ratio = scale / view.scale
        return { scale, x: next.center.x - (last.center.x - view.x) * ratio, y: next.center.y - (last.center.y - view.y) * ratio }
      })
    }
    previous.current = next
    return true
  }
  const end = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    const cancelled = event.type === 'pointercancel' || event.type === 'lostpointercapture'
    if (blocked.current || cancelled) {
      suppress(event)
      pending.current = null
      onCancel()
    } else {
      const action = pending.current
      pending.current = null
      action?.()
    }
    pointers.current.delete(event.pointerId)
    previous.current = pair()
    if (!pointers.current.size) reset()
  }
  return { active, down, move, end, defer: (action: () => void) => { pending.current = action }, blocked: () => blocked.current }
}
