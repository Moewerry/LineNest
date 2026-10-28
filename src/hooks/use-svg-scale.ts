import { useLayoutEffect, useRef, useState } from 'react'

export function useSvgScale(width: number, height: number) {
  const ref = useRef<SVGSVGElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => {
      const box = element.getBoundingClientRect()
      if (box.width > 0 && box.height > 0) setScale(Math.min(box.width / width, box.height / height))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [width, height])
  return { ref, scale }
}
