import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Group, Image as CanvasImage, Layer, Line, Rect, Stage } from 'react-konva'
import type Konva from 'konva'
import { Button } from '@/components/ui/button'
import { getImageAsset, isSameImageSource } from '@/lib/images'
import { canvasColors } from '@/lib/canvas-colors'
import { canvasStrokeWidth } from '@/lib/display-stroke'
import { bounds, boxBetween, childrenOf, containsLocked, containsSplit, inBox, isLocked, rotationAround, scopeTarget, segmentIntersectsBox, segments } from '../geometry'
import { resizeHandleFromId, selectionResizeMatrix, type SelectionResizeHandle } from '../geometry/resize-selection'
import { transformSelection, useEditor } from '../model/store'
import type { Box, ImageInfo, Point, Snapshot, SplitAxis } from '../model/types'
import { isTextTarget } from '../hooks/use-shortcuts'
import { useModeGuide } from '../hooks/use-mode-guide'
import { useCanvasRotation } from '../hooks/use-canvas-rotation'
import { useTemplateDrop } from '../hooks/use-template-drop'
import { NodeLayer } from './NodeLayer'
import { SelectionLayer } from './SelectionLayer'
import { SelectionEditControls } from './SelectionEditControls'
import { enterGroup, leaveGroup, rotateSelection } from '../commands'
import { CanvasContextMenu } from './CanvasContextMenu'
import { CanvasRulers, RULER_SIZE } from './CanvasRulers'
import { CanvasModeStatus } from './CanvasModeStatus'
import { displaySegment } from '../geometry/display-segment'
import { splitLineAt, splitMoveAxis } from '../geometry/split-line'
import { SplitLinePreview } from './SplitLinePreview'
import { CanvasViewControls } from './CanvasViewControls'
import { CanvasDocumentStatus } from './CanvasDocumentStatus'
import { emptyCanvasGuides } from './CanvasGuideControls'
import { CanvasGuideLayer } from './CanvasGuideLayer'
import { CanvasEmptyState } from './CanvasEmptyState'
import { toast } from '@/lib/toast'
import { FloatingFillSettings } from '@/features/fill/FloatingFillSettings'
import { RegionMarkLayer } from '@/features/fill/RegionMarkLayer'
import { containsPoint } from '@/features/fill/geometry'
import { useFillRegions } from '@/features/fill/use-fill-regions'
import { fillCursors } from '@/features/fill/cursors'
import { eraseStroke } from '../geometry/erase'
import { EraserSettings } from './EraserSettings'
import { TemplatePlacementPreview } from '@/features/templates/TemplatePlacementPreview'
import { TemplatePlacementStatus } from '@/features/templates/TemplatePlacementStatus'

type Gesture = { start: Point; current: Point } & (
  | { type: 'line' | 'box' | 'crop'; additive: boolean }
  | { type: 'move' }
  | { type: 'split'; axis: SplitAxis }
  | { type: 'pan'; origin: Point; source: 'space' | 'tool' | 'middle' }
  | { type: 'endpoint'; id: string; end: 'start' | 'end' }
  | { type: 'rotate'; center: Point; initialAngle: number }
  | { type: 'resize'; box: Box; handle: SelectionResizeHandle }
  | { type: 'erase'; draft: Snapshot }
)
const zero = { x: 0, y: 0 }

export function EditorCanvas({ busy: editorBusy, onReplaceImage, onDeleteImage, onImageReady }: { busy: boolean; onReplaceImage: () => void; onDeleteImage: () => void; onImageReady?: (imageId: string) => void }) {
  const { rotating, rotateImage } = useCanvasRotation(editorBusy)
  const busy = editorBusy || rotating
  const container = useRef<HTMLDivElement>(null), stage = useRef<Konva.Stage>(null)
  const [size, setSize] = useState({ width: 1, height: 1 })
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const previousViewport = useRef<{ image: ImageInfo | null; width: number; height: number } | null>(null)
  const [guides, setGuides] = useState(emptyCanvasGuides)
  const [gesture, setGesture] = useState<Gesture | null>(null), gestureRef = useRef<Gesture | null>(null)
  const [space, setSpace] = useState(false)
  const [pointerInside, setPointerInside] = useState(false)
  const pointerScreen = useRef<Point | null>(null)
  const spaceRef = useRef(false)
  const [horizontal, setHorizontal] = useState(false)
  const [splitHover, setSplitHover] = useState<SplitAxis | null>(null)
  const [selectionHover, setSelectionHover] = useState<string | null>(null)
  const snapshot = useEditor(s => s.present), tool = useEditor(s => s.tool)
  const heldTemplate = useEditor(s => s.heldTemplate)
  const modeGuideVisible = useModeGuide()
  const fillAction = useEditor(s => s.fillAction)
  const fillRegions = useFillRegions(snapshot.doc, tool === 'fill' && fillAction === 'mark' && !busy)
  const image = snapshot.doc.image, asset = getImageAsset(image?.id)
  const { dragOver: templateDragOver, dropHandlers: templateDropHandlers } = useTemplateDrop(view, busy || !asset)
  const viewport: Box = { x: (RULER_SIZE - view.x) / view.scale, y: (RULER_SIZE - view.y) / view.scale, width: Math.max(0, size.width - RULER_SIZE) / view.scale, height: Math.max(0, size.height - RULER_SIZE) / view.scale }
  const updateGesture = (value: Gesture | null) => { gestureRef.current = value; setGesture(value); if (!value) { setSplitHover(null); setSelectionHover(null) } }
  const fit = () => {
    if (!image) return
    const compact = size.width < 640
    const padding = compact ? 32 : 96, bottom = compact ? 88 : 0
    const scale = Math.max(0.01, Math.min((size.width - RULER_SIZE - padding) / image.width, (size.height - RULER_SIZE - padding - bottom) / image.height, 1))
    setView({ scale, x: RULER_SIZE + (size.width - RULER_SIZE - image.width * scale) / 2, y: RULER_SIZE + (size.height - RULER_SIZE - bottom - image.height * scale) / 2 })
  }
  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  useLayoutEffect(() => {
    const previous = previousViewport.current, previousImage = previous?.image
    if (image && previous && previousImage && image.id !== previousImage.id && previous.width === size.width && previous.height === size.height && isSameImageSource(previousImage.id, image.id)) {
      // Rotate around the image's existing screen center, retaining zoom and pan, including on undo/redo.
      setView(current => ({ ...current, x: current.x + (previousImage.width - image.width) * current.scale / 2, y: current.y + (previousImage.height - image.height) * current.scale / 2 }))
    } else fit()
    previousViewport.current = { image, width: size.width, height: size.height }
    updateGesture(null)
  }, [image?.id, size.width, size.height])
  useEffect(() => {
    if (!onImageReady || !image || !asset || size.width <= 1 || size.height <= 1) return
    // Wait for the fitted canvas to render and paint before completing the import.
    let paintedFrame: number | undefined
    const frame = requestAnimationFrame(() => {
      stage.current?.draw()
      paintedFrame = requestAnimationFrame(() => onImageReady(image.id))
    })
    return () => {
      cancelAnimationFrame(frame)
      if (paintedFrame !== undefined) cancelAnimationFrame(paintedFrame)
    }
  }, [onImageReady, image, asset, size.width, size.height, view])
  useEffect(() => { spaceRef.current = false; setSpace(false); setHorizontal(false); updateGesture(null) }, [image?.id, busy])
  useLayoutEffect(() => {
    if (!heldTemplate || !pointerInside || space || gestureRef.current?.type === 'pan' || !pointerScreen.current) return
    const p = pointerScreen.current
    useEditor.getState().moveHeldTemplate({ x: (p.x - view.x) / view.scale, y: (p.y - view.y) / view.scale })
  }, [view, space, pointerInside, heldTemplate?.layout, heldTemplate?.imageId])
  useEffect(() => () => useEditor.getState().cancelTemplatePlacement(), [])
  useEffect(() => {
    const changeSplitDirection = (axis: SplitAxis) => {
      setHorizontal(axis === 'horizontal')
      const active = gestureRef.current
      if (active?.type !== 'split') return
      const currentImage = useEditor.getState().present.doc.image
      if (!currentImage) {
        updateGesture(null)
        return
      }
      updateGesture({ ...active, axis })
    }
    const down = (e: KeyboardEvent) => {
      const state = useEditor.getState()
      if (busy || !state.present.doc.image || e.isComposing) return
      if (e.code === 'Space') {
        if (e.ctrlKey || e.metaKey || e.altKey) return
        const target = e.target instanceof HTMLElement ? e.target : null
        if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]')) return
        const button = target?.closest('button, [role="button"]')
        if (button && !button.closest('[data-canvas-shortcuts], [data-editor-settings]')) return
        e.preventDefault()
        if (state.tool === 'pan') return
        if (!spaceRef.current) {
          spaceRef.current = true; setSpace(true)
          if (gestureRef.current && gestureRef.current.type !== 'pan') updateGesture(null)
        }
        container.current?.focus({ preventScroll: true })
        return
      }
      if (isTextTarget(e.target)) return
      if (state.heldTemplate) return
      if (e.code === 'KeyW' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); changeSplitDirection('horizontal') }
      if (e.key === 'Escape' && gestureRef.current) { e.stopImmediatePropagation(); updateGesture(null) }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (spaceRef.current) e.preventDefault()
        spaceRef.current = false; setSpace(false)
        if (gestureRef.current?.type === 'pan' && gestureRef.current.source === 'space') updateGesture(null)
      }
      if (e.code === 'KeyW') changeSplitDirection('vertical')
    }
    const cancel = () => { spaceRef.current = false; setSpace(false); setHorizontal(false); setPointerInside(false); updateGesture(null) }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', cancel)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', cancel) }
  }, [busy])
  useEffect(() => {
    const cancel = (e: PointerEvent) => { if (!stage.current?.container().contains(e.target as Node) || e.type === 'pointercancel') updateGesture(null) }
    window.addEventListener('pointerup', cancel); window.addEventListener('pointercancel', cancel)
    return () => { window.removeEventListener('pointerup', cancel); window.removeEventListener('pointercancel', cancel) }
  }, [])
  useEffect(() => useEditor.subscribe((state, previous) => {
    if (state.present !== previous.present || state.tool !== previous.tool || (!!state.heldTemplate !== !!previous.heldTemplate)) updateGesture(null)
  }), [])
  const pointer = (): Point => {
    const p = stage.current?.getPointerPosition() ?? zero
    return { x: (p.x - view.x) / view.scale, y: (p.y - view.y) / view.scale }
  }
  const clamp = (p: Point): Point => image ? { x: Math.max(0, Math.min(image.width, p.x)), y: Math.max(0, Math.min(image.height, p.y)) } : p
  const begin = (event: Konva.KonvaEventObject<PointerEvent>) => {
    if (!image || busy || (event.evt.button !== 0 && event.evt.button !== 1)) return
    const p = pointer(), start = clamp(p), state = useEditor.getState()
    const capture = () => {
      event.evt.preventDefault()
      if (event.evt.target instanceof Element) event.evt.target.setPointerCapture(event.evt.pointerId)
    }
    const screenPoint = stage.current?.getPointerPosition()
    if (screenPoint && (screenPoint.x < RULER_SIZE || screenPoint.y < RULER_SIZE)) return
    if (tool === 'pan' || spaceRef.current || event.evt.button === 1) {
      event.evt.preventDefault()
      const screen = stage.current?.getPointerPosition() ?? zero
      if (event.evt.target instanceof Element) event.evt.target.setPointerCapture(event.evt.pointerId)
      updateGesture({ type: 'pan', start: screen, current: screen, origin: { x: view.x, y: view.y }, source: event.evt.button === 1 ? 'middle' : tool === 'pan' ? 'tool' : 'space' })
      return
    }
    if (state.heldTemplate) {
      if (event.evt.ctrlKey || event.evt.metaKey || event.evt.altKey) return
      event.evt.preventDefault()
      try { state.placeHeldTemplate(p) }
      catch (error) { toast.error(error instanceof Error ? error.message : '模板放置失败') }
      return
    }
    const hit = event.target.id()
    if (tool === 'erase') {
      if (event.evt.ctrlKey || event.evt.metaKey || event.evt.altKey) return
      event.evt.preventDefault()
      if (event.evt.target instanceof Element) event.evt.target.setPointerCapture(event.evt.pointerId)
      const draft = structuredClone(state.present)
      eraseStroke(draft, p, p, view.scale, viewport)
      updateGesture({ type: 'erase', start: p, current: p, draft })
      return
    }
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
      event.evt.preventDefault()
      if (event.evt.target instanceof Element) event.evt.target.setPointerCapture(event.evt.pointerId)
      if (splitMoveAxis(state.present, p, view.scale)) {
        updateGesture({ type: 'move', start: p, current: p })
        return
      }
      updateGesture({ type: 'split', axis: horizontal ? 'horizontal' : 'vertical', start: p, current: p })
      return
    }
    const resizeHandle = tool === 'select' ? resizeHandleFromId(hit) : undefined
    if (resizeHandle) {
      const box = bounds(snapshot.doc, snapshot.selected)
      if (!box || snapshot.selected.some(id => containsLocked(snapshot.doc, id)) || containsSplit(snapshot.doc, snapshot.selected)) return
      capture()
      updateGesture({ type: 'resize', box, handle: resizeHandle, start: p, current: p }); return
    }
    if (hit === 'selection-move' && tool === 'select') {
      if (snapshot.selected.some(id => containsLocked(snapshot.doc, id))) return
      capture()
      updateGesture({ type: 'move', start: p, current: p }); return
    }
    if (hit === 'rotate-handle') {
      const box = bounds(snapshot.doc, snapshot.selected)
      if (!box || snapshot.selected.some(id => containsLocked(snapshot.doc, id))) return
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      capture()
      updateGesture({ type: 'rotate', center, initialAngle: Math.atan2(p.y - center.y, p.x - center.x), start: p, current: p }); return
    }
    if (tool === 'crop') {
      if (!inBox(p, { x: 0, y: 0, width: image.width, height: image.height })) return
      capture()
      updateGesture({ type: tool, start, current: start, additive: false }); return
    }
    if (tool === 'line' && !hit) {
      updateGesture({ type: 'line', start: p, current: p, additive: false }); return
    }
    if (hit.startsWith('endpoint:')) {
      const [, end, id] = hit.split(':')
      if (event.evt.shiftKey) { state.select(snapshot.selected.filter(selected => selected !== id)); return }
      capture()
      updateGesture({ type: 'endpoint', id, end: end as 'start' | 'end', start: p, current: p }); return
    }
    const target = hit ? scopeTarget(snapshot.doc, hit, snapshot.scope) : null
    if (target) {
      if (isLocked(snapshot.doc, target)) return
      if (event.evt.shiftKey) {
        state.select(snapshot.selected.includes(target) ? snapshot.selected.filter(id => id !== target) : [...snapshot.selected, target]); return
      }
      if (!snapshot.selected.includes(target)) state.select([target])
      if (!useEditor.getState().present.selected.some(id => containsLocked(snapshot.doc, id))) {
        capture()
        updateGesture({ type: 'move', start: p, current: p })
      }
    } else updateGesture({ type: 'box', start: p, current: p, additive: event.evt.shiftKey })
  }
  const track = (event: Konva.KonvaEventObject<PointerEvent>) => {
    const active = gestureRef.current
    const p = pointer()
    pointerScreen.current = stage.current?.getPointerPosition() ?? null
    if (useEditor.getState().heldTemplate && !spaceRef.current && active?.type !== 'pan') {
      return
    }
    if (!active) {
      setSplitHover(tool === 'split' && !busy ? splitMoveAxis(useEditor.getState().present, p, view.scale) : null)
      const hit = event.target.id(), handle = resizeHandleFromId(hit)
      const target = scopeTarget(snapshot.doc, hit, snapshot.scope)
      let cursor: string | null = null
      if (tool === 'select' && !busy) {
        if (handle) cursor = handle.cursor
        else if (hit === 'rotate-handle') cursor = 'grab'
        else if (hit.startsWith('endpoint:')) cursor = 'crosshair'
        else if (hit === 'selection-move' || (target && snapshot.selected.includes(target) && !containsLocked(snapshot.doc, target))) cursor = 'move'
      }
      setSelectionHover(cursor)
      return
    }
    if (active.type === 'pan') {
      const screen = stage.current?.getPointerPosition()
      if (screen) setView(v => ({ ...v, x: active.origin.x + screen.x - active.start.x, y: active.origin.y + screen.y - active.start.y }))
    } else if (active.type === 'erase') {
      const draft = structuredClone(active.draft)
      eraseStroke(draft, active.current, p, view.scale, viewport)
      updateGesture({ ...active, current: p, draft })
    } else updateGesture({ ...active, current: active.type === 'crop' ? clamp(p) : p })
  }
  const finish = () => {
    const active = gestureRef.current
    if (!active) return
    const { start } = active, state = useEditor.getState()
    const current = ['move', 'endpoint', 'resize', 'rotate'].includes(active.type) ? pointer() : active.current
    const distance = Math.hypot(current.x - start.x, current.y - start.y) * view.scale
    if (active.type === 'erase') {
      eraseStroke(active.draft, current, pointer(), view.scale, viewport)
      state.commit(draft => Object.assign(draft, active.draft), 'erase')
    }
    if (active.type === 'split' && image) {
      const line = splitLineAt(pointer(), active.axis, image)
      state.addLine(line.start, line.end, active.axis)
    }
    if (active.type === 'line' && distance > 3 && image && segmentIntersectsBox(start, current, { x: 0, y: 0, width: image.width, height: image.height })) state.addLine(start, current)
    if (active.type === 'move' && distance > 1) state.move({ x: current.x - start.x, y: current.y - start.y })
    if (active.type === 'endpoint' && distance > 1) state.endpoint(active.id, active.end, current)
    if (active.type === 'rotate' && distance > 1) rotateSelection(rotationDegrees({ ...active, current }))
    if (active.type === 'resize' && distance > 1) state.commit(draft => transformSelection(draft, selectionResizeMatrix(active.box, active.handle, start, current)))
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
  const preview = gesture?.type === 'erase' ? gesture.draft : gesture?.type === 'rotate' || gesture?.type === 'move' || gesture?.type === 'resize' ? structuredClone(snapshot) : snapshot
  if (gesture?.type === 'rotate') transformSelection(preview, rotationAround(gesture.center, rotationDegrees(gesture)))
  if (gesture?.type === 'move') transformSelection(preview, [1, 0, 0, 1, gesture.current.x - gesture.start.x, gesture.current.y - gesture.start.y])
  if (gesture?.type === 'resize') transformSelection(preview, selectionResizeMatrix(gesture.box, gesture.handle, gesture.start, gesture.current))
  const splitCursor = tool === 'split' && !busy && gesture?.type !== 'split' ? splitHover : null
  const selectionCursor = gesture?.type === 'resize' ? gesture.handle.cursor : gesture?.type === 'move' ? 'move' : gesture?.type === 'rotate' ? 'grabbing' : gesture?.type === 'endpoint' ? 'crosshair' : selectionHover ?? 'default'
  return <CanvasContextMenu disabled={busy || tool === 'erase' || !!heldTemplate} onReplaceImage={onReplaceImage} onDeleteImage={onDeleteImage}><div ref={container} data-canvas-shortcuts tabIndex={0} role="region" aria-label="编辑画布" aria-describedby={image && heldTemplate ? 'template-placement-status' : image && modeGuideVisible ? 'canvas-mode-status' : undefined} className="canvas-surface relative min-h-0 min-w-0 flex-1 overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring" style={{ cursor: gesture?.type === 'pan' ? 'grabbing' : space || tool === 'pan' ? 'grab' : heldTemplate ? 'crosshair' : splitCursor ? splitCursor === 'horizontal' ? 'ns-resize' : 'ew-resize' : tool === 'select' ? selectionCursor : tool === 'fill' ? fillCursors[fillAction] : tool === 'erase' ? fillCursors.erase : 'crosshair' }}
    {...templateDropHandlers}
    onPointerEnter={event => {
      const rect = event.currentTarget.getBoundingClientRect()
      const screen = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      pointerScreen.current = screen
      setPointerInside(true)
      if (!editorBusy && !spaceRef.current) useEditor.getState().moveHeldTemplate({ x: (screen.x - view.x) / view.scale, y: (screen.y - view.y) / view.scale })
    }}
    onPointerMoveCapture={event => {
      const rect = event.currentTarget.getBoundingClientRect()
      const screen = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      pointerScreen.current = screen
      if (!editorBusy && !spaceRef.current && gestureRef.current?.type !== 'pan') useEditor.getState().moveHeldTemplate({ x: (screen.x - view.x) / view.scale, y: (screen.y - view.y) / view.scale })
    }}
    onPointerLeave={() => { setSplitHover(null); setSelectionHover(null); setPointerInside(false) }}
    onPointerDownCapture={e => { if (e.target instanceof Element && !e.target.closest('button, input')) e.currentTarget.focus({ preventScroll: true }) }}>
    {image && asset ? <Stage ref={stage} width={size.width} height={size.height} style={{ touchAction: 'none' }} onPointerDown={begin} onPointerMove={track} onPointerUp={finish} onDblClick={e => {
      if (busy || tool !== 'select' || spaceRef.current || useEditor.getState().heldTemplate) return
      const hit = e.target.id()
      const id = hit === 'selection-move' && snapshot.selected.length === 1 ? snapshot.selected[0] : scopeTarget(snapshot.doc, hit, snapshot.scope)
      if (id) { updateGesture(null); enterGroup(id) }
    }} onContextMenu={e => {
      if (useEditor.getState().heldTemplate) { e.evt.preventDefault(); return }
      if (tool === 'erase') {
        e.evt.preventDefault()
        e.evt.stopPropagation()
        if (busy) return
        updateGesture(null)
        useEditor.getState().undoErase()
        return
      }
      updateGesture(null)
      const hit = e.target.id(), id = hit.startsWith('endpoint:') ? hit.split(':')[2] : hit
      const target = scopeTarget(snapshot.doc, id, snapshot.scope)
      if (target && !snapshot.selected.includes(target)) useEditor.getState().select([target])
    }} onWheel={e => {
      e.evt.preventDefault()
      if (editorBusy || !e.evt.deltaY) return
      const factor = e.evt.deltaY < 0 ? 1.1 : 1 / 1.1
      pointerScreen.current = stage.current?.getPointerPosition() ?? null
      const state = useEditor.getState()
      if (state.heldTemplate && !spaceRef.current && gestureRef.current?.type !== 'pan') state.resizeHeldTemplate(factor)
      else if (!rotating) zoom(factor, pointerScreen.current ?? undefined)
    }}>
      <Layer><Group x={view.x} y={view.y} scaleX={view.scale} scaleY={view.scale} clipX={0} clipY={0} clipWidth={image.width} clipHeight={image.height}>
        <CanvasImage image={asset.element} width={image.width} height={image.height} listening={false} />
        <RegionMarkLayer marks={preview.doc.marks ?? []} scale={view.scale} selectable={tool === 'select' && !space && !busy && !heldTemplate} />
        {preview.doc.crop && <Rect {...preview.doc.crop} stroke={canvasColors.selection} strokeWidth={canvasStrokeWidth(view.scale)} dash={[6 / view.scale, 4 / view.scale]} fill={canvasColors.cropFill} listening={false} />}
        {gesture?.type === 'line' && <Line points={[gesture.start.x, gesture.start.y, gesture.current.x, gesture.current.y]} stroke={canvasColors.selection} strokeWidth={canvasStrokeWidth(view.scale, 2)} lineCap="round" listening={false} />}
      </Group><Group x={view.x} y={view.y} scaleX={view.scale} scaleY={view.scale}>
        <NodeLayer snapshot={preview} scale={view.scale} delta={delta} endpoint={endpoint} viewport={viewport} />
        {tool !== 'erase' && !heldTemplate && <SelectionLayer snapshot={preview} scale={view.scale} delta={delta} marquee={marquee} endpoint={endpoint} interactive={tool === 'select' && !space && !busy} />}
        {gesture?.type === 'split' && <SplitLinePreview point={gesture.current} axis={gesture.axis} image={image} viewport={viewport} scale={view.scale} />}
        {heldTemplate && (pointerInside || templateDragOver) && !editorBusy && <TemplatePlacementPreview placement={heldTemplate} viewScale={view.scale} />}
      </Group></Layer>
      <Layer listening={false}><Group x={view.x} y={view.y} scaleX={view.scale} scaleY={view.scale}>
        <CanvasGuideLayer image={image} scale={view.scale} guides={guides} />
      </Group></Layer>
    </Stage> : null}
    {!image && <CanvasEmptyState onPick={onReplaceImage} busy={busy} />}
    {image && <>
      <CanvasRulers image={image} view={view} size={size} />
      <div className="pointer-events-none absolute left-7 right-14 top-7 flex flex-wrap items-start gap-2 sm:left-10 sm:top-10 md:right-5">
        {heldTemplate ? <TemplatePlacementStatus placement={heldTemplate} dragging={templateDragOver} temporaryView={space || gesture?.type === 'pan'} onCancel={() => useEditor.getState().cancelTemplatePlacement()} /> : modeGuideVisible && <div className="flex min-w-0 max-w-full flex-col gap-2">
          <CanvasModeStatus tool={tool} horizontal={horizontal} erasing={fillAction === 'erase'} panSource={gesture?.type === 'pan' && gesture.source === 'middle' ? 'middle' : space ? 'space' : null} />
        </div>}
        {!heldTemplate && tool === 'select' && !busy && !space && gesture?.type !== 'pan' && <SelectionEditControls snapshot={preview} />}
        {snapshot.scope && tool !== 'select' && <Button variant="outline" size="sm" className="pointer-events-auto bg-card text-xs" disabled={busy} onClick={leaveGroup}>退出组内编辑（Esc）</Button>}
      </div>
      {tool === 'fill' && <FloatingFillSettings busy={busy} loading={fillRegions.loading} error={fillRegions.error} />}
      {tool === 'erase' && <EraserSettings busy={busy} onDeleteImage={onDeleteImage} />}
      <CanvasDocumentStatus snapshot={snapshot} />
      <CanvasViewControls scale={view.scale} busy={busy} rotating={rotating} guides={guides} onGuidesChange={setGuides} onZoom={zoom} onFit={fit} onRotate={() => void rotateImage()} />
    </>}
  </div></CanvasContextMenu>
}

function rotationDegrees(gesture: Extract<Gesture, { type: 'rotate' }>): number {
  const angle = (Math.atan2(gesture.current.y - gesture.center.y, gesture.current.x - gesture.center.x) - gesture.initialAngle) * 180 / Math.PI
  return ((angle + 540) % 360) - 180
}
