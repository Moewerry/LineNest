import { useCallback, useEffect, useRef, useState } from 'react'
import { discardImageAsset, rotateImageClockwise } from '@/lib/images'
import { toast } from '@/lib/toast'
import { useEditor } from '../model/store'
import type { ImageInfo } from '../model/types'

export function useCanvasRotation(disabled: boolean) {
  const [rotating, setRotating] = useState(false)
  const operation = useRef<symbol | null>(null)
  useEffect(() => () => { operation.current = null }, [])

  const rotateImage = useCallback(async () => {
    const image = useEditor.getState().present.doc.image
    if (disabled || operation.current || !image) return
    const request = Symbol('canvas-rotation')
    operation.current = request
    setRotating(true)
    let rotated: ImageInfo | null = null
    try {
      rotated = await rotateImageClockwise(image)
      const state = useEditor.getState()
      // Navigation or a different current image supersedes this asynchronous image conversion.
      if (operation.current !== request || state.present.doc.image?.id !== image.id) {
        discardImageAsset(rotated.id)
        return
      }
      if (rotated.width !== image.height || rotated.height !== image.width) throw new Error('图片旋转失败，请重试')
      state.rotateImage(rotated)
    } catch (error) {
      if (rotated && useEditor.getState().present.doc.image?.id !== rotated.id) discardImageAsset(rotated.id)
      if (operation.current === request) toast.error(error instanceof Error ? error.message : '旋转失败')
    } finally {
      if (operation.current === request) {
        operation.current = null
        setRotating(false)
      }
    }
  }, [disabled])

  return { rotating, rotateImage }
}
