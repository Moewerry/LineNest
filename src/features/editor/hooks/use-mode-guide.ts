import { useEffect, useState } from 'react'
import { useEditor } from '../model/store'

export function useModeGuide() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismiss = () => setVisible(false)
    const dismissDrag = (event: PointerEvent) => {
      if (event.buttons !== 0) dismiss()
    }
    // Capture before tool buttons and shortcuts run, so a new mode can show its guide.
    document.addEventListener('pointerdown', dismiss, true)
    document.addEventListener('pointermove', dismissDrag, true)
    document.addEventListener('wheel', dismiss, { capture: true, passive: true })
    document.addEventListener('keydown', dismiss, true)
    document.addEventListener('dragstart', dismiss, true)
    window.addEventListener('blur', dismiss)

    const unsubscribe = useEditor.subscribe((state, previous) => {
      if (state.tool !== previous.tool) setVisible(true)
      else if (state.present !== previous.present) dismiss()
    })

    return () => {
      unsubscribe()
      document.removeEventListener('pointerdown', dismiss, true)
      document.removeEventListener('pointermove', dismissDrag, true)
      document.removeEventListener('wheel', dismiss, true)
      document.removeEventListener('keydown', dismiss, true)
      document.removeEventListener('dragstart', dismiss, true)
      window.removeEventListener('blur', dismiss)
    }
  }, [])

  return visible
}
