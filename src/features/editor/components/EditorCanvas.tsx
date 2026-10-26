import { useEffect, useRef, useState } from 'react'
import { Group, Image as CanvasImage, Layer, Line, Rect, Stage } from 'react-konva'
import type Konva from 'konva'
import { ImagePlus, Maximize, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getImageAsset } from '@/lib/images'
import { boxBetween, childrenOf, containsLocked, inBox, isLocked, scopeTarget, segmentIntersectsBox, segments } from '../geometry'
import { useEditor } from '../model/store'
import type { Box, Point } from '../model/types'
import { isTextTarget } from '../hooks/use-shortcuts'
import { NodeLayer } from './NodeLayer'
import { SelectionLayer } from './SelectionLayer'

type Gesture = { start: Point; current: Point } & (
  | { type: 'line' | 'box' | 'crop'; additive: boolean }
  | { type: 'move' | 'pan' }
  | { type: 'endpoint'; id: string; end: 'start' | 'end' }
)
const zero = { x: 0, y: 0 }

export function EditorCanvas({ onPick, onDrop, busy }: { onPick: () => void; onDrop: (file: File) => void; busy: boolean }) {
  const container = useRef<HTMLDivElement>(null), stage = useRef<Konva.Stage>(null)
  const [size, setSize] = useState({ width: 1, height: 1 })
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const [gesture, setGesture] = useState<Gesture | null>(null), gestureRef = useRef<Gesture | null>(null)
  const [space, setSpace] = useState(false), [dropping, setDropping] = useState(false)
  const snapshot = useEditor(s => s.present), tool = useEditor(s => s.tool)
  const image = snapshot.doc.image, asset = getImageAsset(image?.id)
  const updateGesture = (value: Gesture | null) => { gestureRef.current = value; setGesture(value) }
  const fit = () => {
    if (!image) return
    const scale = Math.max(0.01, Math.min((size.width - 96) / image.width, (size.height - 96) / image.height, 1))
    setView({ scale, x: (size.width - image.width * scale) / 2, y: (size.height - image.height * scale) / 2 })
  }
  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => { fit(); updateGesture(null) }, [image?.id, size.width, size.height])
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isTextTarget(e.target)) return
      if (e.code === 'Space') { e.preventDefault(); setSpace(true) }
      if (e.key === 'Escape') updateGesture(null)
    }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpace(false) }
    const cancel = () => { setSpace(false); updateGesture(null) }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', cancel)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', cancel) }
  }, [])
  useEffect(() => {
    const cancel = (e: PointerEvent) => { if (!container.current?.contains(e.target as Node) || e.type === 'pointercancel') updateGesture(null) }
    window.addEventListener('pointerup', cancel); window.addEventListener('pointercancel', cancel)
    return () => { window.removeEventListener('pointerup', cancel); window.removeEventListener('pointercancel', cancel) }
  }, [])
  const pointer = (): Point => {
    const p = stage.current?.getPointerPosition() ?? zero
    return { x: (p.x - view.x) / view.scale, y: (p.y - view.y) / view.scale }
  }
  const clamp = (p: Point): Point => image ? { x: Math.max(0, Math.min(image.width, p.x)), y: Math.max(0, Math.min(image.height, p.y)) } : p
  const begin = (event: Konva.KonvaEventObject<PointerEvent>) => {
    if (!image || busy || (event.evt.button !== 0 && event.evt.button !== 1)) return
    const p = pointer(), start = clamp(p), state = useEditor.getState()
    if (space || event.evt.button === 1) { event.evt.preventDefault(); updateGesture({ type: 'pan', start: p, current: p }); return }
    if (tool === 'line' || tool === 'crop') {
      if (!inBox(p, { x: 0, y: 0, width: image.width, height: image.height })) return
      updateGesture({ type: tool, start, current: start, additive: false }); return
    }
    const hit = event.target.id()
    if (hit.startsWith('endpoint:')) {
      const [, end, id] = hit.split(':')
      updateGesture({ type: 'endpoint', id, end: end as 'start' | 'end', start: p, current: p }); return
    }
    const target = hit ? scopeTarget(snapshot.doc, hit, snapshot.scope) : null
    if (target) {
      if (isLocked(snapshot.doc, target)) return
      if (event.evt.shiftKey) {
        state.select(snapshot.selected.includes(target) ? snapshot.selected.filter(id => id !== target) : [...snapshot.selected, target]); return
      }
      if (!snapshot.selected.includes(target)) state.select([target])
      if (!useEditor.getState().present.selected.some(id => containsLocked(snapshot.doc, id))) updateGesture({ type: 'move', start: p, current: p })
    } else updateGesture({ type: 'box', start: p, current: p, additive: event.evt.shiftKey })
  }
  const track = () => {
    const active = gestureRef.current
    if (!active) return
    const p = pointer()
    if (active.type === 'pan') {
      setView(v => ({ ...v, x: v.x + (p.x - active.start.x) * v.scale, y: v.y + (p.y - active.start.y) * v.scale }))
    } else updateGesture({ ...active, current: ['line', 'crop', 'endpoint'].includes(active.type) ? clamp(p) : p })
  }
  const finish = () => {
    const active = gestureRef.current
    if (!active) return
    const { start, current } = active, state = useEditor.getState()
    const distance = Math.hypot(current.x - start.x, current.y - start.y) * view.scale
    if (active.type === 'line' && distance > 3) state.addLine(start, current)
    if (active.type === 'move' && distance > 1) state.move({ x: current.x - start.x, y: current.y - start.y })
    if (active.type === 'endpoint' && distance > 1) state.endpoint(active.id, active.end, current)
    if (active.type === 'crop' && distance > 3) {
      const b = boxBetween(start, current)
      if (b.width >= 1 && b.height >= 1) state.setCrop(b)
    }
    if (active.type === 'box') {
      const rect = boxBetween(start, current)
      const ids = distance > 3 ? childrenOf(snapshot.doc, snapshot.scope).filter(id => !isLocked(snapshot.doc, id) && segments(snapshot.doc, [id]).some(line => segmentIntersectsBox(line.start, line.end, rect))) : []
      state.select(active.additive ? [...snapshot.selected, ...ids] : ids)
    }
    updateGesture(null)
  }
  const zoom = (factor: number, p = { x: size.width / 2, y: size.height / 2 }) => setView(v => {
    const scale = Math.min(8, Math.max(0.01, v.scale * factor)), ratio = scale / v.scale
    return { scale, x: p.x - (p.x - v.x) * ratio, y: p.y - (p.y - v.y) * ratio }
  })
  const delta = gesture?.type === 'move' ? { x: gesture.current.x - gesture.start.x, y: gesture.current.y - gesture.start.y } : zero
  const marquee: Box | null = gesture && (gesture.type === 'box' || gesture.type === 'crop') ? boxBetween(gesture.start, gesture.current) : null
  const endpoint = gesture?.type === 'endpoint' ? { id: gesture.id, end: gesture.end, point: gesture.current } : null
  return <div ref={container} className={`canvas-surface relative min-h-0 min-w-0 flex-1 overflow-hidden ${dropping ? 'ring-2 ring-inset ring-ring' : ''}`} style={{ cursor: space ? 'grab' : tool === 'select' ? 'default' : 'crosshair' }}
    onDragOver={e => { e.preventDefault(); setDropping(true) }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropping(false) }} onDrop={e => { e.preventDefault(); setDropping(false); const file = e.dataTransfer.files[0]; if (file && !busy) onDrop(file) }}>
    {image && asset ? <Stage ref={stage} width={size.width} height={size.height} onPointerDown={begin} onPointerMove={track} onPointerUp={finish} onWheel={e => { e.evt.preventDefault(); zoom(e.evt.deltaY < 0 ? 1.1 : 1 / 1.1, stage.current?.getPointerPosition() ?? undefined) }}>
      <Layer><Group x={view.x} y={view.y} scaleX={view.scale} scaleY={view.scale}>
        <CanvasImage image={asset.element} width={image.width} height={image.height} listening={false} />
        <NodeLayer snapshot={snapshot} scale={view.scale} delta={delta} endpoint={endpoint} />
        {snapshot.doc.crop && <Rect {...snapshot.doc.crop} stroke="#237a60" strokeWidth={1.5 / view.scale} dash={[6 / view.scale, 4 / view.scale]} fill="#a7e8cd16" listening={false} />}
        {gesture?.type === 'line' && <Line points={[gesture.start.x, gesture.start.y, gesture.current.x, gesture.current.y]} stroke="#237a60" strokeWidth={2 / view.scale} listening={false} />}
        <SelectionLayer snapshot={snapshot} scale={view.scale} delta={delta} marquee={marquee} endpoint={endpoint} />
      </Group></Layer>
    </Stage> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"><Button size="lg" onClick={onPick} disabled={busy}><ImagePlus />{busy ? '正在读取图片' : '导入图片'}</Button><span className="text-xs text-muted-foreground">或拖入图片</span></div>}
    {image && <>
      <div className="pointer-events-none absolute bottom-5 left-5 text-[11px] text-muted-foreground">{image.width} × {image.height} px{snapshot.selected.length ? ` · 已选 ${snapshot.selected.length} 项` : ''}</div>
      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-xl border bg-white p-1 shadow-xs">
        <Button variant="ghost" size="icon-sm" aria-label="缩小" onClick={() => zoom(1 / 1.2)}><Minus /></Button><span className="w-12 text-center text-xs tabular-nums">{Math.round(view.scale * 100)}%</span><Button variant="ghost" size="icon-sm" aria-label="放大" onClick={() => zoom(1.2)}><Plus /></Button><span className="mx-1 h-4 border-l" /><Button variant="ghost" size="icon-sm" aria-label="适应画布" title="适应画布" onClick={fit}><Maximize /></Button>
      </div>
    </>}
  </div>
}
