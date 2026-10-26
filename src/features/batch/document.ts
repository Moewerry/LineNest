import { segments } from '@/features/editor/geometry'
import type { DocumentData } from '@/features/editor/model/types'
import { templateDocument } from '@/features/templates/layout'
import type { BatchFit, BatchItem, BatchTemplate } from './types'

export function batchDocument(item: BatchItem, template: BatchTemplate, fit: BatchFit): DocumentData {
  const sx = fit === 'relative' ? item.width / template.layout.width : 1
  const sy = fit === 'relative' ? item.height / template.layout.height : 1
  const lines = segments(templateDocument(template.layout))
  return {
    version: 1,
    image: { id: item.id, name: item.file.name, width: item.width, height: item.height },
    crop: null,
    roots: lines.map(line => line.id),
    nodes: Object.fromEntries(lines.map(line => [line.id, {
      id: line.id, name: line.id, parentId: null, locked: false, type: 'line',
      matrix: [1, 0, 0, 1, 0, 0],
      start: { x: line.start.x * sx + item.offsetX, y: line.start.y * sy + item.offsetY },
      end: { x: line.end.x * sx + item.offsetX, y: line.end.y * sy + item.offsetY },
    }])),
  }
}
