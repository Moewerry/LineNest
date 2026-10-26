import { useEffect } from 'react'
import { childrenOf } from '../geometry'
import { useEditor } from '../model/store'
export function isTextTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"]')
}
export function useShortcuts() {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (isTextTarget(event.target)) return
      const state = useEditor.getState(), key = event.key.toLowerCase(), mod = event.ctrlKey || event.metaKey
      if (mod && key === 'a') { event.preventDefault(); state.select(childrenOf(state.present.doc, state.present.scope)) }
      else if (mod && key === 'z') { event.preventDefault(); event.shiftKey ? state.redo() : state.undo() }
      else if (mod && key === 'y') { event.preventDefault(); state.redo() }
      else if (!mod && key === 'v') state.setTool('select')
      else if (!mod && key === 'l') state.setTool('line')
      else if (!mod && key === 'c') state.setTool('crop')
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])
}
