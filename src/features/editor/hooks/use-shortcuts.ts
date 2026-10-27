import { useEffect } from 'react'
import { childrenOf } from '../geometry'
import { useEditor } from '../model/store'
import { deleteSelection, duplicateSelection, enterGroup, groupSelection, leaveGroup, ungroupSelection } from '../commands'
export function isTextTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"], [data-editor-settings]')
}
export function useShortcuts(enabled = true, onMissingImage?: () => void) {
  useEffect(() => {
    if (!enabled) return
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && useEditor.getState().heldTemplate && !event.isComposing && !(event.target instanceof HTMLElement && event.target.closest('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]'))) {
        event.preventDefault(); useEditor.getState().cancelTemplatePlacement(); return
      }
      if (isTextTarget(event.target) || event.isComposing || event.altKey) return
      const state = useEditor.getState(), key = event.key.toLowerCase(), mod = event.ctrlKey || event.metaKey
      if (state.heldTemplate && !(mod && (key === 'z' || key === 'y'))) {
        if (mod && ['a', 'g', 'd'].includes(key)) event.preventDefault()
        return
      }
      if (!state.present.doc.image) {
        if (mod && (key === 'z' || key === 'y')) {
          event.preventDefault()
          if (key === 'y' || event.shiftKey) state.redo()
          else state.undo()
          return
        }
        const editingKey = mod ? ['a', 'g', 'd'].includes(key) : ['s', 'v', 'h', 'l', 'c', 'b', 'e', 'delete', 'backspace', 'enter', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key)
        if (editingKey && !event.repeat && !(event.target instanceof HTMLElement && event.target.closest('button, [role="button"]'))) {
          event.preventDefault()
          onMissingImage?.()
        }
        return
      }
      if (key === 'enter' && event.target instanceof HTMLElement && event.target.closest('button, [role="button"]')) return
      if (mod && key === 'a') { event.preventDefault(); state.select(childrenOf(state.present.doc, state.present.scope)) }
      else if (mod && key === 'z') { event.preventDefault(); event.shiftKey ? state.redo() : state.undo() }
      else if (mod && key === 'y') { event.preventDefault(); state.redo() }
      else if (mod && key === 'g') { event.preventDefault(); event.shiftKey ? ungroupSelection() : groupSelection() }
      else if (mod && key === 'd') { event.preventDefault(); duplicateSelection() }
      else if (key === 'delete' || key === 'backspace') { event.preventDefault(); deleteSelection() }
      else if (key === 'escape') { event.preventDefault(); leaveGroup() }
      else if (key === 'enter' && state.present.selected.length === 1) enterGroup(state.present.selected[0])
      else if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key)) {
        event.preventDefault()
        const step = event.shiftKey ? 10 : 1
        state.move({ x: key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0, y: key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0 })
      }
      else if (!mod && key === 's') state.setTool('split')
      else if (!mod && key === 'v') state.setTool('select')
      else if (!mod && key === 'h') state.setTool('pan')
      else if (!mod && key === 'l') state.setTool('line')
      else if (!mod && key === 'c') state.setTool('crop')
      else if (!mod && key === 'b') state.setTool('fill')
      else if (!mod && key === 'e') state.setTool('erase')
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [enabled, onMissingImage])
}
