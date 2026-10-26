import { useRef, useState, type DragEvent } from 'react'
import { toast } from 'sonner'

export function useImageDrop(onImport: (file: File) => void, disabled = false) {
  const depth = useRef(0)
  const [dragging, setDragging] = useState(false)
  const reset = () => { depth.current = 0; setDragging(false) }
  const hasFiles = (event: DragEvent<HTMLElement>) => Array.from(event.dataTransfer.types).includes('Files')

  return {
    dragging: dragging && !disabled,
    dropHandlers: {
      onDragEnter: (event: DragEvent<HTMLElement>) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        depth.current += 1
        if (!disabled) setDragging(true)
      },
      onDragOver: (event: DragEvent<HTMLElement>) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        event.dataTransfer.dropEffect = disabled ? 'none' : 'copy'
      },
      onDragLeave: (event: DragEvent<HTMLElement>) => {
        if (!hasFiles(event)) return
        depth.current = Math.max(0, depth.current - 1)
        if (!depth.current) reset()
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        if (!hasFiles(event) && !event.dataTransfer.files.length) return
        event.preventDefault()
        reset()
        if (disabled) return
        if (event.dataTransfer.files.length > 1) { toast.error('请每次导入一张图片'); return }
        const file = event.dataTransfer.files[0]
        if (file) onImport(file)
      },
    },
  }
}
