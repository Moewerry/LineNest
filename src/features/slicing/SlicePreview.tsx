import { useEffect, useRef } from 'react'
import { getImageAsset } from '@/lib/images'
import { canvasColors } from '@/lib/canvas-colors'
import type { DocumentData } from '@/features/editor/model/types'
import { regionPath } from './export'
import type { SliceResult } from './types'

export function SlicePreview({ doc, result, selected, marked = false }: { doc: DocumentData; result: SliceResult; selected: Set<number>; marked?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current, asset = getImageAsset(doc.image?.id)
    if (!canvas || !asset) return
    const { x, y, width, height } = result.area
    const scale = Math.min(1000 / width, 600 / height, 1)
    canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale))
    const context = canvas.getContext('2d')
    if (!context) return
    context.scale(scale, scale); context.translate(-x, -y)
    context.drawImage(asset.element, 0, 0)
    for (const region of result.regions) {
      const path = regionPath(region), included = selected.has(region.id)
      const mark = marked ? doc.marks?.[region.id - 1] : undefined
      context.save()
      context.fillStyle = included ? mark?.color ?? canvasColors.previewFill : 'transparent'
      if (included && mark) context.globalAlpha = mark.opacity
      context.fill(path, 'evenodd')
      context.restore()
      context.setLineDash(included ? [] : [4 / scale, 3 / scale])
      context.strokeStyle = included ? mark?.color ?? canvasColors.selection : canvasColors.mutedLine; context.lineWidth = 1.5 / scale; context.stroke(path)
    }
    context.setLineDash([])
    context.font = `600 ${11 / scale}px sans-serif`; context.textAlign = 'center'; context.textBaseline = 'middle'
    for (const region of result.regions) {
      context.beginPath(); context.arc(region.label.x, region.label.y, 11 / scale, 0, Math.PI * 2)
      const included = selected.has(region.id)
      context.fillStyle = included ? canvasColors.ink : canvasColors.handle; context.fill()
      context.strokeStyle = canvasColors.ink; context.lineWidth = 1 / scale; context.stroke()
      context.fillStyle = included ? canvasColors.handle : canvasColors.ink; context.fillText(String(region.id), region.label.x, region.label.y)
    }
  }, [doc, result, selected, marked])
  return <div className="canvas-surface flex min-h-40 items-center justify-center overflow-hidden rounded-xl border p-3"><canvas ref={ref} aria-label="切片区域预览" className="max-h-[50vh] max-w-full object-contain" /></div>
}
