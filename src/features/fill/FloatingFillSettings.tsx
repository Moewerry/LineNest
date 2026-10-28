import { useEffect, useId, useRef, useState, type PointerEvent } from 'react'
import { ChevronDown, ChevronUp, GripHorizontal, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useEditor } from '@/features/editor/model/store'
import { FillSettings } from './FillSettings'

type Props = { busy: boolean; loading: boolean; error: string }
type Position = { left: number; bottom: number }

export function FloatingFillSettings(props: Props) {
  const color = useEditor(state => state.fillColor)
  const opacity = useEditor(state => state.fillOpacity)
  const colorLabel = `当前标记颜色：${color}，不透明度：${Number((opacity * 100).toFixed(2))}%`
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position>({ left: 40, bottom: 56 })
  const [contentHeight, setContentHeight] = useState(240)
  const panel = useRef<HTMLDivElement>(null)
  const drag = useRef<{ pointerId: number; x: number; y: number; position: Position } | null>(null)
  const contentId = useId()
  const constrain = (value: Position): Position => {
    const element = panel.current, parent = element?.parentElement
    if (!element || !parent) return value
    return {
      left: Math.max(32, Math.min(value.left, Math.max(32, parent.clientWidth - element.offsetWidth - 12))),
      bottom: Math.max(12, Math.min(value.bottom, Math.max(12, parent.clientHeight - element.offsetHeight - 32))),
    }
  }
  useEffect(() => {
    const element = panel.current, parent = element?.parentElement
    if (!element || !parent) return
    const observer = new ResizeObserver(() => {
      setContentHeight(Math.max(0, parent.clientHeight - 100))
      setPosition(value => {
        const next = constrain(value)
        return next.left === value.left && next.bottom === value.bottom ? value : next
      })
    })
    observer.observe(element)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])
  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, position }
  }
  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const active = drag.current
    if (!active || active.pointerId !== event.pointerId) return
    setPosition(constrain({ left: active.position.left + event.clientX - active.x, bottom: active.position.bottom - event.clientY + active.y }))
  }

  return <Collapsible ref={panel} open={open} onOpenChange={setOpen} data-editor-settings
    aria-label="标记设置" className="pointer-events-auto absolute z-10 w-[340px] max-w-[calc(100%-44px)] overflow-hidden rounded-xl border bg-card"
    style={position} onContextMenu={event => event.stopPropagation()}>
    <CollapsibleContent id={contentId} className="fill-settings-reveal overflow-hidden">
      <div className="overflow-y-auto p-4" style={{ maxHeight: contentHeight }}><FillSettings {...props} /></div>
    </CollapsibleContent>
    <div className="flex items-center gap-1 bg-primary px-2 py-1.5 text-white">
      <Button variant="ghost" size="icon-sm" aria-label="拖动标记设置，方向键移动" title="拖动标记设置" className="touch-none cursor-grab text-white hover:bg-white/15 hover:text-white active:cursor-grabbing"
        onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }} onLostPointerCapture={() => { drag.current = null }}
        onKeyDown={event => {
          const step = event.shiftKey ? 32 : 8
          const offsets: Record<string, Position> = { ArrowLeft: { left: -step, bottom: 0 }, ArrowRight: { left: step, bottom: 0 }, ArrowUp: { left: 0, bottom: step }, ArrowDown: { left: 0, bottom: -step } }
          const offset = offsets[event.key]
          if (!offset) return
          event.preventDefault()
          event.stopPropagation()
          setPosition(value => constrain({ left: value.left + offset.left, bottom: value.bottom + offset.bottom }))
        }}><GripHorizontal className="size-4" /></Button>
      <CollapsibleTrigger asChild><Button className="flex-1 justify-between text-white hover:bg-white/15" variant="ghost" aria-controls={contentId}>
        <span className="flex items-center gap-2">
          <Settings2 className="size-4" />标记设置
          <span role="img" aria-label={colorLabel} title={colorLabel} className="size-4 shrink-0 overflow-hidden rounded-sm border border-white/70 bg-white ring-1 ring-black/15">
            <span aria-hidden="true" className="block size-full" style={{ backgroundColor: color, opacity }} />
          </span>
        </span>
        {open ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
      </Button></CollapsibleTrigger>
    </div>
  </Collapsible>
}
