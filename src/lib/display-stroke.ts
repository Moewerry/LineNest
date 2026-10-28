const validScale = (scale: number) => Number.isFinite(scale) && scale > 0 ? scale : 1

// Reduce screen-space thickness when zooming out, with a subpixel visibility floor.
export function screenStrokeWidth(scale: number, width = 1.5) {
  return Math.max(0.35, width * Math.min(1, Math.sqrt(validScale(scale))))
}

export function canvasStrokeWidth(scale: number, width = 1.5) {
  return screenStrokeWidth(scale, width) / validScale(scale)
}
