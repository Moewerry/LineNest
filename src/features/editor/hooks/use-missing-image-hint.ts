import { useEffect, useRef, type PointerEvent } from 'react'
import { toast } from '@/lib/toast'
import { useEditor } from '../model/store'

export function useMissingImageHint(enabled: boolean) {
  const imageId = useEditor(s => s.present.doc.image?.id)
  const attempts = useRef({ count: 0, last: 0 })
  useEffect(() => { attempts.current = { count: 0, last: 0 } }, [enabled, imageId])
  const notify = () => {
    if (!enabled || useEditor.getState().present.doc.image) {
      attempts.current = { count: 0, last: 0 }
      return
    }
    const now = Date.now()
    const count = now - attempts.current.last < 5000 ? attempts.current.count + 1 : 1
    attempts.current = { count, last: now }
    if (count >= 3) {
      toast.info('需要先上传图片才能进行编辑操作', { id: 'missing-editor-image' })
      attempts.current.count = 0
    }
  }
  const onPointerDownCapture = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || !(event.target instanceof Element)) return
    const target = event.target
    if (target.closest('button:disabled, [role="menuitem"][data-disabled]') ||
      (target.closest('[aria-label="编辑画布"]') && !target.closest('button, input'))) notify()
  }
  return { notify, onPointerDownCapture }
}
