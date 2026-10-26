import type { ImageInfo, Point, SplitAxis } from '../model/types'

export function splitLineAt(point: Point, axis: SplitAxis, image: ImageInfo) {
  const horizontal = axis === 'horizontal'
  const limit = horizontal ? image.height : image.width
  const position = Math.max(1, Math.min(limit - 1, Math.round(horizontal ? point.y : point.x)))
  return {
    start: horizontal ? { x: 0, y: position } : { x: position, y: 0 },
    end: horizontal ? { x: image.width, y: position } : { x: position, y: image.height },
  }
}
