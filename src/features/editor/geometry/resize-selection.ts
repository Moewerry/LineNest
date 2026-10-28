import type { Box, Matrix, Point } from '../model/types'

export const selectionResizeHandles = [
  { name: 'nw', x: -1, y: -1, cursor: 'nwse-resize' },
  { name: 'n', x: 0, y: -1, cursor: 'ns-resize' },
  { name: 'ne', x: 1, y: -1, cursor: 'nesw-resize' },
  { name: 'e', x: 1, y: 0, cursor: 'ew-resize' },
  { name: 'se', x: 1, y: 1, cursor: 'nwse-resize' },
  { name: 's', x: 0, y: 1, cursor: 'ns-resize' },
  { name: 'sw', x: -1, y: 1, cursor: 'nesw-resize' },
  { name: 'w', x: -1, y: 0, cursor: 'ew-resize' },
] as const

export type SelectionResizeHandle = typeof selectionResizeHandles[number]

export function resizeHandleFromId(id: string) {
  return selectionResizeHandles.find(handle => id === `resize:${handle.name}`)
}

export function resizeHandlesForBox(box: Box) {
  return selectionResizeHandles.filter(handle => (!handle.x || box.width > 0) && (!handle.y || box.height > 0))
}

// Keep the matrix invertible and avoid a size jump for an already tiny or oversized selection.
function clampScale(value: number, length: number) {
  return Math.max(Math.min(1, 1 / length), Math.min(Math.max(1, 16384 / length), value))
}

export function selectionResizeMatrix(box: Box, handle: SelectionResizeHandle, start: Point, current: Point): Matrix {
  const dx = current.x - start.x, dy = current.y - start.y
  const anchor = {
    x: box.x + (handle.x < 0 ? box.width : handle.x > 0 ? 0 : box.width / 2),
    y: box.y + (handle.y < 0 ? box.height : handle.y > 0 ? 0 : box.height / 2),
  }
  let scaleX = handle.x && box.width > 0 ? clampScale(1 + handle.x * dx / box.width, box.width) : 1
  let scaleY = handle.y && box.height > 0 ? clampScale(1 + handle.y * dy / box.height, box.height) : 1
  if (handle.x && handle.y && box.width > 0 && box.height > 0) {
    // Project the drag onto the original diagonal so corners preserve the template's proportions.
    const factor = 1 + (handle.x * dx * box.width + handle.y * dy * box.height) / (box.width ** 2 + box.height ** 2)
    scaleX = scaleY = clampScale(factor, Math.max(box.width, box.height))
  }
  return [scaleX, 0, 0, scaleY, anchor.x * (1 - scaleX), anchor.y * (1 - scaleY)]
}
