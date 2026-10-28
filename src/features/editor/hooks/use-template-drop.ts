import { useEffect, useState, type DragEvent } from 'react'
import { useEditor } from '../model/store'
import { RULER_SIZE } from '../components/CanvasRulers'
import { TEMPLATE_DRAG_TYPE } from '@/features/templates/use-template-card'
import { toast } from '@/lib/toast'

export function useTemplateDrop(view: { x: number; y: number; scale: number }, disabled: boolean) {
  const [dragOver, setDragOver] = useState(false)
  useEffect(() => {
    const reset = () => setDragOver(false)
    window.addEventListener('dragend', reset)
    return () => window.removeEventListener('dragend', reset)
  }, [])
  const isTemplateDrag = (event: DragEvent<HTMLDivElement>) => Array.from(event.dataTransfer.types).includes(TEMPLATE_DRAG_TYPE)
  const position = (event: DragEvent<HTMLDivElement>) => {
    const state = useEditor.getState(), held = state.heldTemplate
    if (disabled || !held || held.imageId !== state.present.doc.image?.id) return null
    if (event.target instanceof Element && event.target.closest('button, input')) return null
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left, y = event.clientY - rect.top
    if (x < RULER_SIZE || y < RULER_SIZE || x >= rect.width || y >= rect.height) return null
    return { x: (x - view.x) / view.scale, y: (y - view.y) / view.scale }
  }
  const hover = (event: DragEvent<HTMLDivElement>) => {
    if (!isTemplateDrag(event)) return
    event.preventDefault()
    event.stopPropagation()
    const center = position(event)
    event.dataTransfer.dropEffect = center ? 'copy' : 'none'
    setDragOver(!!center)
    if (center) useEditor.getState().moveHeldTemplate(center)
  }

  return {
    dragOver,
    dropHandlers: {
      onDragEnter: hover,
      onDragOver: hover,
      onDragLeave: (event: DragEvent<HTMLDivElement>) => {
        if (!isTemplateDrag(event) || (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) return
        setDragOver(false)
      },
      onDrop: (event: DragEvent<HTMLDivElement>) => {
        if (!isTemplateDrag(event)) return
        event.preventDefault()
        event.stopPropagation()
        setDragOver(false)
        const center = position(event)
        if (!center) return
        try {
          useEditor.getState().placeHeldTemplate(center)
          event.currentTarget.focus({ preventScroll: true })
        } catch (error) {
          useEditor.getState().cancelTemplatePlacement()
          toast.error(error instanceof Error ? error.message : '模板放置失败')
        }
      },
    },
  }
}
