import { useEffect, useRef, type DragEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { useEditor } from '@/features/editor/model/store'
import type { TemplateRecord } from '@/lib/db'
import { toast } from '@/lib/toast'
import type { LineTemplate } from './layout'

export const TEMPLATE_DRAG_TYPE = 'application/x-linenest-template'

export function useTemplateCard(template: TemplateRecord, disabled: boolean, onApply: () => void) {
  const dragged = useRef(false)
  const draggedLayout = useRef<LineTemplate | null>(null)

  const cancelDrag = () => {
    const state = useEditor.getState()
    if (draggedLayout.current && state.heldTemplate?.layout === draggedLayout.current) state.cancelTemplatePlacement()
    draggedLayout.current = null
  }

  useEffect(() => cancelDrag, [])

  return {
    draggable: !disabled,
    onPointerDown: () => { dragged.current = false },
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.code === 'Space') event.stopPropagation()
    },
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      if (!disabled && (!dragged.current || event.detail === 0)) onApply()
    },
    onDragStart: (event: DragEvent<HTMLButtonElement>) => {
      if (disabled) { event.preventDefault(); return }
      try {
        const state = useEditor.getState()
        state.pickUpTemplate(template.layout, template.name)
        draggedLayout.current = useEditor.getState().heldTemplate!.layout
        dragged.current = true
        event.dataTransfer.effectAllowed = 'copy'
        event.dataTransfer.setData(TEMPLATE_DRAG_TYPE, template.id)
      } catch (error) {
        event.preventDefault()
        cancelDrag()
        toast.error(error instanceof Error ? error.message : '无法拖动模板')
      }
    },
    onDragEnd: cancelDrag,
  }
}
