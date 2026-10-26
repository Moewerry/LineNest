import { useEffect, useRef } from 'react'
import { getImageAsset } from '@/lib/images'
import type { DocumentData } from '@/features/editor/model/types'
import { regionPath } from './export'
import type { SliceResult } from './types'

export function SlicePreview({ doc, result, selected }: { doc: DocumentData; result: SliceResult; selected: Set<number> }) {
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
      context.fillStyle = included ? '#a7e8cd44' : '#ffffffbb'
      context.fill(path, 'evenodd')
      context.strokeStyle = included ? '#237a60' : '#a1a1aa'; context.lineWidth = 1.5 / scale; context.stroke(path)
    }
    context.font = `600 ${11 / scale}px sans-serif`; context.textAlign = 'center'; context.textBaseline = 'middle'
    for (const region of result.regions) {
      context.beginPath(); context.arc(region.label.x, region.label.y, 11 / scale, 0, Math.PI * 2)
      context.fillStyle = selected.has(region.id) ? '#27272a' : '#71717a'; context.fill()
      context.fillStyle = 'white'; context.fillText(String(region.id), region.label.x, region.label.y)
    }
  }, [doc, result, selected])
  return <div className="canvas-surface flex min-h-40 items-center justify-center overflow-hidden rounded-xl border p-3"><canvas ref={ref} aria-label="切片区域预览" className="max-h-[42vh] max-w-full object-contain" /></div>
}
