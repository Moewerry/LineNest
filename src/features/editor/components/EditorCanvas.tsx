import { useEffect, useRef, useState } from 'react'
import { Group, Image as CanvasImage, Layer, Line, Rect, Stage } from 'react-konva'
import type Konva from 'konva'
import { Maximize, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getImageAsset } from '@/lib/images'
import { canvasColors } from '@/lib/canvas-colors'
import { bounds, boxBetween, childrenOf, containsLocked, inBox, isLocked, rotationAround, scopeTarget, segmentIntersectsBox, segments } from '../geometry'
import { transformSelection, useEditor } from '../model/store'
import type { Box, Point } from '../model/types'
import { isTextTarget } from '../hooks/use-shortcuts'
import { NodeLayer } from './NodeLayer'
import { SelectionLayer } from './SelectionLayer'
import { enterGroup, leaveGroup, rotateSelection } from '../commands'
import { CanvasContextMenu } from './CanvasContextMenu'
import { CanvasEmptyState } from './CanvasEmptyState'

type Gesture = { start: Point; current: Point } & (
  | { type: 'line' | 'box' | 'crop'; additive: boolean }
  | { type: 'move' | 'pan' }
  | { type: 'endpoint'; id: string; end: 'start' | 'end' }
  | { type: 'rotate'; center: Point; initialAngle: number }
)
const zero = { x: 0, y: 0 }

export function EditorCanvas({ onPick, busy }: { onPick: () => void; busy: boolean }) {
  const container = useRef<HTMLDivElement>(null), stage = useRef<Konva.Stage>(null)
  const [size, setSize] = useState({ width: 1, height: 1 })
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const [gesture, setGesture] = useState<Gesture | null>(null), gestureRef = useRef<Gesture | null>(null)
  const [space, setSpace] = useState(false)
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
      if (e.isComposing) return
      if (e.code === 'Space' && e.target instanceof HTMLElement && e.target.closest('button, [role="button"]')) return
      if (e.code === 'Space') { e.preventDefault(); setSpace(true) }
      if (e.key === 'Escape' && gestureRef.current) { e.stopImmediatePropagation(); updateGesture(null) }
    }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpace(false) }
    const cancel = () => { setSpace(false); updateGesture(null) }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', cancel)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', cancel) }
  }, [])
  useEffect(() => {
    const cancel = (e: PointerEvent) => { if (!stage.current?.container().contains(e.target as Node) || e.type === 'pointercancel') updateGesture(null) }
    window.addEventListener('pointerup', cancel); window.addEventListener('pointercancel', cancel)
    return () => { window.removeEventListener('pointerup', cancel); window.removeEventListener('pointercancel', cancel) }
  }, [])
  useEffect(() => useEditor.subscribe((state, previous) => {
    if (state.present !== previous.present) updateGesture(null)
  }), [])
  const pointer = (): Point => {
    const p = stage.current?.getPointerPosition() ?? zero
    return { x: (p.x - view.x) / view.scale, y: (p.y - view.y) / view.scale }
  }
  const clamp = (p: Point): Point => image ? { x: Math.max(0, Math.min(image.width, p.x)), y: Math.max(0, Math.min(image.height, p.y)) } : p
  const begin = (event: Konva.KonvaEventObject<PointerEvent>) => {
    if (!image || busy || (event.evt.button !== 0 && event.evt.button !== 1)) return
    const p = pointer(), start = clamp(p), state = useEditor.getState()
    if (space || event.evt.button === 1) { event.evt.preventDefault(); updateGesture({ type: 'pan', start: p, current: p }); return }
    const hit = event.target.id()
    if (hit === 'rotate-handle') {
      const box = bounds(snapshot.doc, snapshot.selected)
      if (!box || snapshot.selected.some(id => containsLocked(snapshot.doc, id))) return
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      updateGesture({ type: 'rotate', center, initialAngle: Math.atan2(p.y - center.y, p.x - center.x), start: p, current: p }); return
    }
    if (tool === 'crop') {
      if (!inBox(p, { x: 0, y: 0, width: image.width, height: image.height })) return
      updateGesture({ type: tool, start, current: start, additive: false }); return
    }
    if (tool === 'line' && !hit) {
      updateGesture({ type: 'line', start: p, current: p, additive: false }); return
    }
    if (hit.startsWith('endpoint:')) {
      const [, end, id] = hit.split(':')
      if (event.evt.shiftKey) { state.select(snapshot.selected.filter(selected => selected !== id)); return }
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
    } else updateGesture({ ...active, current: active.type === 'crop' ? clamp(p) : p })
  }
  const finish = () => {
    const active = gestureRef.current
    if (!active) return
    const { start, current } = active, state = useEditor.getState()
    const distance = Math.hypot(current.x - start.x, current.y - start.y) * view.scale
    if (active.type === 'line' && distance > 3 && image && segmentIntersectsBox(start, current, { x: 0, y: 0, width: image.width, height: image.height })) state.addLine(start, current)
    if (active.type === 'move' && distance > 1) state.move({ x: current.x - start.x, y: current.y - start.y })
    if (active.type === 'endpoint' && distance > 1) state.endpoint(active.id, active.end, current)
    if (active.type === 'rotate' && distance > 1) rotateSelection(rotationDegrees(active))
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
  const zoom = (factor: number, p = { x: size.width / 2, y: size.height / 2 }) => {
    updateGesture(null)
    setView(v => {
      const scale = Math.min(8, Math.max(0.01, v.scale * factor)), ratio = scale / v.scale
      return { scale, x: p.x - (p.x - v.x) * ratio, y: p.y - (p.y - v.y) * ratio }
    })
  }
  const delta = gesture?.type === 'move' ? { x: gesture.current.x - gesture.start.x, y: gesture.current.y - gesture.start.y } : zero
  const marquee: Box | null = gesture && (gesture.type === 'box' || gesture.type === 'crop') ? boxBetween(gesture.start, gesture.current) : null
  const endpoint = gesture?.type === 'endpoint' ? { id: gesture.id, end: gesture.end, point: gesture.current } : null
  const preview = gesture?.type === 'rotate' ? structuredClone(snapshot) : snapshot
  if (gesture?.type === 'rotate') transformSelection(preview, rotationAround(gesture.center, rotationDegrees(gesture)))
  return <CanvasContextMenu disabled={busy}><div ref={container} tabIndex={0} role="region" aria-label="编辑画布" className="canvas-surface relative min-h-0 min-w-0 flex-1 overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring" style={{ cursor: space ? 'grab' : tool === 'select' ? 'default' : 'crosshair' }}
    onPointerDownCapture={e => { if (e.target instanceof Element && !e.target.closest('button, input')) e.currentTarget.focus({ preventScroll: true }) }}>
    {image && asset ? <Stage ref={stage} width={size.width} height={size.height} onPointerDown={begin} onPointerMove={track} onPointerUp={finish} onDblClick={e => {
      if (tool !== 'select') return
      const id = scopeTarget(snapshot.doc, e.target.id(), snapshot.scope)
      if (id) { updateGesture(null); enterGroup(id) }
    }} onContextMenu={e => {
      updateGesture(null)
      const hit = e.target.id(), id = hit.startsWith('endpoint:') ? hit.split(':')[2] : hit
      const target = scopeTarget(snapshot.doc, id, snapshot.scope)
      if (target && !snapshot.selected.includes(target)) useEditor.getState().select([target])
    }} onWheel={e => { e.evt.preventDefault(); zoom(e.evt.deltaY < 0 ? 1.1 : 1 / 1.1, stage.current?.getPointerPosition() ?? undefined) }}>
      <Layer><Group x={view.x} y={view.y} scaleX={view.scale} scaleY={view.scale} clipX={0} clipY={0} clipWidth={image.width} clipHeight={image.height}>
        <CanvasImage image={asset.element} width={image.width} height={image.height} listening={false} />
        <NodeLayer snapshot={preview} scale={view.scale} delta={delta} endpoint={endpoint} />
        {snapshot.doc.crop && <Rect {...snapshot.doc.crop} stroke={canvasColors.selection} strokeWidth={1.5 / view.scale} dash={[6 / view.scale, 4 / view.scale]} fill={canvasColors.cropFill} listening={false} />}
        {gesture?.type === 'line' && <Line points={[gesture.start.x, gesture.start.y, gesture.current.x, gesture.current.y]} stroke={canvasColors.selection} strokeWidth={2 / view.scale} listening={false} />}
      </Group><Group x={view.x} y={view.y} scaleX={view.scale} scaleY={view.scale}>
        <SelectionLayer snapshot={preview} scale={view.scale} delta={delta} marquee={marquee} endpoint={endpoint} />
      </Group></Layer>
    </Stage> : <CanvasEmptyState onPick={onPick} busy={busy} />}
    {image && <>
      {snapshot.scope && <div className="absolute left-4 top-4"><Button variant="outline" size="sm" className="bg-card text-xs" onClick={leaveGroup}>退出组内编辑 · Esc</Button></div>}
      <div className="pointer-events-none absolute bottom-5 left-5 text-[11px] text-muted-foreground">{image.width} × {image.height} px{snapshot.selected.length ? ` · 已选 ${snapshot.selected.length} 项` : ''}</div>
      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full border bg-card p-1.5 shadow-sm">
        <Button variant="ghost" size="icon-sm" aria-label="缩小" onClick={() => zoom(1 / 1.2)}><Minus /></Button><span className="w-12 text-center text-xs tabular-nums">{Math.round(view.scale * 100)}%</span><Button variant="ghost" size="icon-sm" aria-label="放大" onClick={() => zoom(1.2)}><Plus /></Button><span className="mx-1 h-4 border-l" /><Button variant="ghost" size="icon-sm" aria-label="适应画布" title="适应画布" onClick={fit}><Maximize /></Button>
      </div>
    </>}
  </div></CanvasContextMenu>
}

function rotationDegrees(gesture: Extract<Gesture, { type: 'rotate' }>): number {
  const angle = (Math.atan2(gesture.current.y - gesture.center.y, gesture.current.x - gesture.center.x) - gesture.initialAngle) * 180 / Math.PI
  return ((angle + 540) % 360) - 180
}
