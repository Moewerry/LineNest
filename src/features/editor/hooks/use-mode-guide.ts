import { useEffect, useState } from 'react'
import { useEditor } from '../model/store'

export function useModeGuide() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismiss = () => setVisible(false)
    const dismissOutside = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[data-tool-guide]')) return
      dismiss()
    }
    const dismissDrag = (event: PointerEvent) => {
      if (event.buttons !== 0) dismissOutside(event)
    }
    // Capture before tool buttons and shortcuts run, so a new mode can show its guide.
    document.addEventListener('pointerdown', dismissOutside, true)
    document.addEventListener('pointermove', dismissDrag, true)
    document.addEventListener('wheel', dismissOutside, { capture: true, passive: true })
    document.addEventListener('keydown', dismissOutside, true)
    document.addEventListener('dragstart', dismissOutside, true)
    window.addEventListener('blur', dismiss)

    const unsubscribe = useEditor.subscribe((state, previous) => {
      if (state.tool !== previous.tool || state.toolGuideRequest !== previous.toolGuideRequest) setVisible(true)
      else if (state.present !== previous.present) dismiss()
    })

    return () => {
      unsubscribe()
      document.removeEventListener('pointerdown', dismissOutside, true)
      document.removeEventListener('pointermove', dismissDrag, true)
      document.removeEventListener('wheel', dismissOutside, true)
      document.removeEventListener('keydown', dismissOutside, true)
      document.removeEventListener('dragstart', dismissOutside, true)
      window.removeEventListener('blur', dismiss)
    }
  }, [])

  return visible
}
