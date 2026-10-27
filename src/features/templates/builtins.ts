import type { Box } from '@/features/editor/model/types'
import type { LineTemplate } from './layout'

export type BuiltinTemplate = { id: string; name: string; description: string; layout: LineTemplate }

export const builtinTemplates: readonly BuiltinTemplate[] = [{
  id: 'builtin:center-square',
  name: '1:1 正方形',
  description: '按原图短边，居中裁出一张正方形',
  layout: { version: 1, width: 1000, height: 1000, nodes: {}, roots: [] },
}]

export const findBuiltinTemplate = (id: string) => builtinTemplates.find(template => template.id === id)

export function centeredSquare(width: number, height: number, offset = { x: 0, y: 0 }): Box {
  const size = Math.min(width, height)
  return {
    x: Math.max(0, Math.min(width - size, Math.floor((width - size) / 2) + offset.x)),
    y: Math.max(0, Math.min(height - size, Math.floor((height - size) / 2) + offset.y)),
    width: size,
    height: size,
  }
}
