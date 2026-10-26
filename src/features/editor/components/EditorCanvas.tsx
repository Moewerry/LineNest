import { useEffect, useRef, useState } from 'react'
import { Group, Image as CanvasImage, Layer, Line, Rect, Stage } from 'react-konva'
import type Konva from 'konva'
import { Button } from '@/components/ui/button'
import { getImageAsset } from '@/lib/images'
import { canvasColors } from '@/lib/canvas-colors'
import { bounds, boxBetween, childrenOf, containsLocked, inBox, isLocked, rotationAround, scopeTarget, segmentIntersectsBox, segments } from '../geometry'
import { transformSelection, useEditor } from '../model/store'
import type { Box, Point, SplitAxis } from '../model/types'
import { isTextTarget } from '../hooks/use-shortcuts'
import { useModeGuide } from '../hooks/use-mode-guide'
import { NodeLayer } from './NodeLayer'
import { SelectionLayer } from './SelectionLayer'
import { enterGroup, leaveGroup, rotateSelection } from '../commands'
import { CanvasContextMenu } from './CanvasContextMenu'
import { CanvasRulers, RULER_SIZE } from './CanvasRulers'
import { CanvasModeStatus } from './CanvasModeStatus'
import { displaySegment } from '../geometry/display-segment'
import { splitLineAt } from '../geometry/split-line'
import { SplitLinePreview } from './SplitLinePreview'
import { CanvasViewControls } from './CanvasViewControls'
import { toast } from 'sonner'
import { FloatingFillSettings } from '@/features/fill/FloatingFillSettings'
import { RegionMarkLayer } from '@/features/fill/RegionMarkLayer'
import { containsPoint } from '@/features/fill/geometry'
import { useFillRegions } from '@/features/fill/use-fill-regions'
import { fillCursors } from '@/features/fill/cursors'

type Gesture = { start: Point; current: Point } & (
  | { type: 'line' | 'box' | 'crop'; additive: boolean }
  | { type: 'move' }
  | { type: 'split'; axis: SplitAxis }
  | { type: 'pan'; origin: Point; source: 'space' | 'tool' | 'middle' }
  | { type: 'endpoint'; id: string; end: 'start' | 'end' }
  | { type: 'rotate'; center: Point; initialAngle: number }
)
const zero = { x: 0, y: 0 }

export function EditorCanvas({ busy, rotating, onRotateImage }: { busy: boolean; rotating: boolean; onRotateImage: () => void }) {
  const container = useRef<HTMLDivElement>(null), stage = useRef<Konva.Stage>(null)
  const [size, setSize] = useState({ width: 1, height: 1 })
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const [gesture, setGesture] = useState<Gesture | null>(null), gestureRef = useRef<Gesture | null>(null)
  const [space, setSpace] = useState(false)
  const spaceRef = useRef(false)
  const [horizontal, setHorizontal] = useState(false)
  const snapshot = useEditor(s => s.present), tool = useEditor(s => s.tool)
  const modeGuideVisible = useModeGuide()
  const fillAction = useEditor(s => s.fillAction)
  const fillRegions = useFillRegions(snapshot.doc, tool === 'fill' && fillAction === 'mark' && !busy)
  const image = snapshot.doc.image, asset = getImageAsset(image?.id)
  const viewport: Box = { x: (RULER_SIZE - view.x) / view.scale, y: (RULER_SIZE - view.y) / view.scale, width: Math.max(0, size.width - RULER_SIZE) / view.scale, height: Math.max(0, size.height - RULER_SIZE) / view.scale }
  const updateGesture = (value: Gesture | null) => { gestureRef.current = value; setGesture(value) }
  const fit = () => {
    if (!image) return
    const scale = Math.max(0.01, Math.min((size.width - RULER_SIZE - 96) / image.width, (size.height - RULER_SIZE - 96) / image.height, 1))
    setView({ scale, x: RULER_SIZE + (size.width - RULER_SIZE - image.width * scale) / 2, y: RULER_SIZE + (size.height - RULER_SIZE - image.height * scale) / 2 })
  }
  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => { fit(); updateGesture(null) }, [image?.id, size.width, size.height])
  useEffect(() => { spaceRef.current = false; setSpace(false); setHorizontal(false); updateGesture(null) }, [image?.id, busy])
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!useEditor.getState().present.doc.image) return
      if (isTextTarget(e.target)) return
      if (e.isComposing) return
      if (e.code === 'KeyW' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); setHorizontal(true) }
      if (e.code === 'Space') {
        if (e.ctrlKey || e.metaKey || e.altKey) return
        const button = e.target instanceof HTMLElement ? e.target.closest('button, [role="button"]') : null
        if (button && !button.closest('[data-canvas-shortcuts]')) return
        e.preventDefault()
        if (!spaceRef.current) {
          spaceRef.current = true; setSpace(true)
          if (gestureRef.current && gestureRef.current.type !== 'pan') updateGesture(null)
        }
        container.current?.focus({ preventScroll: true })
      }
      if (e.key === 'Escape' && gestureRef.current) { e.stopImmediatePropagation(); updateGesture(null) }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (spaceRef.current) e.preventDefault()
        spaceRef.current = false; setSpace(false)
        if (gestureRef.current?.type === 'pan' && gestureRef.current.source === 'space') updateGesture(null)
      }
      if (e.code === 'KeyW') setHorizontal(false)
    }
    const cancel = () => { spaceRef.current = false; setSpace(false); setHorizontal(false); updateGesture(null) }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', cancel)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', cancel) }
  }, [])
  useEffect(() => {
    const cancel = (e: PointerEvent) => { if (!stage.current?.container().contains(e.target as Node) || e.type === 'pointercancel') updateGesture(null) }
    window.addEventListener('pointerup', cancel); window.addEventListener('pointercancel', cancel)
    return () => { window.removeEventListener('pointerup', cancel); window.removeEventListener('pointercancel', cancel) }
  }, [])
  useEffect(() => useEditor.subscribe((state, previous) => {
    if (state.present !== previous.present || state.tool !== previous.tool) updateGesture(null)
  }), [])
  const pointer = (): Point => {
    const p = stage.current?.getPointerPosition() ?? zero
    return { x: (p.x - view.x) / view.scale, y: (p.y - view.y) / view.scale }
  }
  const clamp = (p: Point): Point => image ? { x: Math.max(0, Math.min(image.width, p.x)), y: Math.max(0, Math.min(image.height, p.y)) } : p
  const begin = (event: Konva.KonvaEventObject<PointerEvent>) => {
    if (!image || busy || (event.evt.button !== 0 && event.evt.button !== 1)) return
    const p = pointer(), start = clamp(p), state = useEditor.getState()
    const screenPoint = stage.current?.getPointerPosition()
    if (screenPoint && (screenPoint.x < RULER_SIZE || screenPoint.y < RULER_SIZE)) return
    if (tool === 'pan' || spaceRef.current || event.evt.button === 1) {
      event.evt.preventDefault()
      const screen = stage.current?.getPointerPosition() ?? zero
      if (event.evt.target instanceof Element) event.evt.target.setPointerCapture(event.evt.pointerId)
      updateGesture({ type: 'pan', start: screen, current: screen, origin: { x: view.x, y: view.y }, source: event.evt.button === 1 ? 'middle' : tool === 'pan' ? 'tool' : 'space' })
      return
    }
    const hit = event.target.id()
    if (tool === 'fill') {
      if (event.evt.ctrlKey || event.evt.metaKey || event.evt.altKey || !inBox(p, { x: 0, y: 0, width: image.width, height: image.height })) return
      if (fillAction === 'erase') { state.eraseRegionMark(p); return }
      if (!fillRegions.ready) return
      const region = fillRegions.regions.find(candidate => containsPoint(candidate.rings, p))
      if (!region) return
      try { state.markRegion(region.rings, region.label) }
      catch (error) { toast.error(error instanceof Error ? error.message : '无法标记区域') }
      return
    }
    if (tool === 'split') {
      if (event.evt.ctrlKey || event.evt.metaKey || event.evt.altKey) return
      // Only the split coordinate must be inside the image; allow clicks along its outer guide.
      if (horizontal ? p.y <= 0 || p.y >= image.height : p.x <= 0 || p.x >= image.width) return
      if (horizontal ? image.height <= 1 : image.width <= 1) return
      event.evt.preventDefault()
      if (event.evt.target instanceof Element) event.evt.target.setPointerCapture(event.evt.pointerId)
      updateGesture({ type: 'split', axis: horizontal ? 'horizontal' : 'vertical', start: p, current: p })
      return
    }
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
      const screen = stage.current?.getPointerPosition()
      if (screen) setView(v => ({ ...v, x: active.origin.x + screen.x - active.start.x, y: active.origin.y + screen.y - active.start.y }))
    } else updateGesture({ ...active, current: active.type === 'crop' ? clamp(p) : p })
  }
  const finish = () => {
    const active = gestureRef.current
    if (!active) return
    const { start, current } = active, state = useEditor.getState()
    const distance = Math.hypot(current.x - start.x, current.y - start.y) * view.scale
    if (active.type === 'split' && image) {
      const line = splitLineAt(pointer(), active.axis, image)
      state.addLine(line.start, line.end, active.axis)
    }
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
      const ids = distance > 3 ? childrenOf(snapshot.doc, snapshot.scope).filter(id => !isLocked(snapshot.doc, id) && segments(snapshot.doc, [id]).some(line => {
        const node = snapshot.doc.nodes[line.id]
        const display = displaySegment(line, node.type === 'line' ? node.splitAxis : undefined, viewport)
        return segmentIntersectsBox(display.start, display.end, rect)
      })) : []
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
  const delta = zero
  const marquee: Box | null = gesture && (gesture.type === 'box' || gesture.type === 'crop') ? boxBetween(gesture.start, gesture.current) : null
  const endpoint = gesture?.type === 'endpoint' ? { id: gesture.id, end: gesture.end, point: gesture.current } : null
  const preview = gesture?.type === 'rotate' || gesture?.type === 'move' ? structuredClone(snapshot) : snapshot
  if (gesture?.type === 'rotate') transformSelection(preview, rotationAround(gesture.center, rotationDegrees(gesture)))
  if (gesture?.type === 'move') transformSelection(preview, [1, 0, 0, 1, gesture.current.x - gesture.start.x, gesture.current.y - gesture.start.y])
  return <CanvasContextMenu disabled={busy}><div ref={container} data-canvas-shortcuts tabIndex={0} role="region" aria-label="编辑画布" aria-describedby={image && modeGuideVisible ? 'canvas-mode-status' : undefined} className="canvas-surface relative min-h-0 min-w-0 flex-1 overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring" style={{ cursor: gesture?.type === 'pan' ? 'grabbing' : space || tool === 'pan' ? 'grab' : tool === 'select' ? 'default' : tool === 'fill' ? fillCursors[fillAction] : 'crosshair' }}
    onPointerDownCapture={e => { if (e.target instanceof Element && !e.target.closest('button, input')) e.currentTarget.focus({ preventScroll: true }) }}>
    {image && asset ? <Stage ref={stage} width={size.width} height={size.height} onPointerDown={begin} onPointerMove={track} onPointerUp={finish} onDblClick={e => {
      if (tool !== 'select' || spaceRef.current) return
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
        <RegionMarkLayer marks={snapshot.doc.marks ?? []} scale={view.scale} />
        {snapshot.doc.crop && <Rect {...snapshot.doc.crop} stroke={canvasColors.selection} strokeWidth={1.5 / view.scale} dash={[6 / view.scale, 4 / view.scale]} fill={canvasColors.cropFill} listening={false} />}
        {gesture?.type === 'line' && <>
          <Line points={[gesture.start.x, gesture.start.y, gesture.current.x, gesture.current.y]} stroke={canvasColors.lineHalo} strokeWidth={4.5 / view.scale} lineCap="round" listening={false} />
          <Line points={[gesture.start.x, gesture.start.y, gesture.current.x, gesture.current.y]} stroke={canvasColors.selection} strokeWidth={2 / view.scale} lineCap="round" listening={false} />
        </>}
      </Group><Group x={view.x} y={view.y} scaleX={view.scale} scaleY={view.scale}>
        <NodeLayer snapshot={preview} scale={view.scale} delta={delta} endpoint={endpoint} viewport={viewport} />
        <SelectionLayer snapshot={preview} scale={view.scale} delta={delta} marquee={marquee} endpoint={endpoint} />
        {gesture?.type === 'split' && <SplitLinePreview point={gesture.current} axis={gesture.axis} image={image} viewport={viewport} scale={view.scale} />}
      </Group></Layer>
    </Stage> : null}
    {image && <>
      <CanvasRulers image={image} view={view} size={size} />
      <div className="pointer-events-none absolute left-10 right-5 top-10 flex flex-wrap items-start gap-2">
        {modeGuideVisible && <div className="flex min-w-0 max-w-full flex-col gap-2">
          <CanvasModeStatus tool={tool} horizontal={horizontal} erasing={fillAction === 'erase'} panSource={gesture?.type === 'pan' && gesture.source === 'middle' ? 'middle' : space ? 'space' : null} />
        </div>}
        {snapshot.scope && <Button variant="outline" size="sm" className="pointer-events-auto bg-card text-xs" onClick={leaveGroup}>退出组内编辑 · Esc</Button>}
      </div>
      {tool === 'fill' && <FloatingFillSettings busy={busy} loading={fillRegions.loading} error={fillRegions.error} />}
      <div className="pointer-events-none absolute bottom-5 left-10 max-w-[calc(100%-300px)] rounded bg-card/90 px-2 py-1 text-[11px] text-muted-foreground">{image.width} × {image.height} px{snapshot.selected.length ? ` · 已选 ${snapshot.selected.length} 项` : ''}{snapshot.doc.marks?.length ? ` · 标记 ${snapshot.doc.marks.length} 块` : ''}</div>
      <CanvasViewControls scale={view.scale} busy={busy} rotating={rotating} onZoom={zoom} onFit={fit} onRotate={onRotateImage} />
    </>}
  </div></CanvasContextMenu>
}

function rotationDegrees(gesture: Extract<Gesture, { type: 'rotate' }>): number {
  const angle = (Math.atan2(gesture.current.y - gesture.center.y, gesture.current.x - gesture.center.x) - gesture.initialAngle) * 180 / Math.PI
  return ((angle + 540) % 360) - 180
}
