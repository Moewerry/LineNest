import type { RegionMark } from '@/features/editor/model/types'

export function drawMarkThumbnail(context: CanvasRenderingContext2D, marks: RegionMark[], scale: number) {
  for (const mark of marks) {
    const path = new Path2D()
    for (const ring of mark.rings) {
      if (!ring.length) continue
      path.moveTo(ring[0].x, ring[0].y)
      for (let index = 1; index < ring.length; index++) path.lineTo(ring[index].x, ring[index].y)
      path.closePath()
    }
    context.save()
    context.fillStyle = mark.color; context.globalAlpha = mark.opacity
    context.fill(path, 'evenodd')
    context.globalAlpha = 1; context.strokeStyle = mark.color; context.lineWidth = 2 / scale
    context.stroke(path)
    context.restore()
  }
}
