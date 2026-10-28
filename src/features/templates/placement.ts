import type { Box, ImageInfo, Matrix, Point, Snapshot } from '@/features/editor/model/types'
import { apply, bounds, identity } from '@/features/editor/geometry'
import { transformRings } from '@/features/fill/geometry'
import { MAX_MARK_POINTS, MAX_REGION_MARKS } from '@/features/fill/constants'
import { templateDocument, validateLineTemplate, type LineTemplate } from './layout'

export type TemplatePlacement = {
  imageId: string
  name: string
  layout: LineTemplate
  bounds: Box
  center: Point | null
  scale: number
}

export function createTemplatePlacement(source: LineTemplate, image: ImageInfo, name: string): TemplatePlacement {
  const layout = validateLineTemplate(source)
  // A carried template has finite edges, so scaling it must not extend split lines back to the image borders.
  for (const node of Object.values(layout.nodes)) {
    node.locked = false
    if (node.type === 'line') delete node.splitAxis
  }
  let box = bounds(templateDocument(layout), layout.roots)
  for (const mark of layout.marks ?? []) {
    for (const ring of mark.rings) for (const point of ring) {
      if (!box) box = { ...point, width: 0, height: 0 }
      const x = Math.min(box.x, point.x), y = Math.min(box.y, point.y)
      box = { x, y, width: Math.max(box.x + box.width, point.x) - x, height: Math.max(box.y + box.height, point.y) - y }
    }
  }
  if (!box || !Object.values(box).every(Number.isFinite) || Math.max(box.width, box.height) <= 0) throw new Error('模板中没有可放置的有效线条或标记块')
  const scale = Math.min(image.width / Math.max(box.width, 1), image.height / Math.max(box.height, 1)) * 0.6
  return { imageId: image.id, name, layout, bounds: box, center: null, scale: placementScale(box, scale) }
}

export function placementScale(box: Box, scale: number) {
  const edge = Math.max(box.width, box.height, 1)
  return Math.round(Math.max(1, Math.min(16384, edge * scale))) / edge
}

export function placementCenter(placement: TemplatePlacement, center: Point): Point {
  const halfWidth = placement.bounds.width * placement.scale / 2
  const halfHeight = placement.bounds.height * placement.scale / 2
  return { x: Math.round(center.x - halfWidth) + halfWidth, y: Math.round(center.y - halfHeight) + halfHeight }
}

export function appendTemplatePlacement(snapshot: Snapshot, placement: TemplatePlacement, center: Point) {
  if (snapshot.doc.image?.id !== placement.imageId) throw new Error('图片已变化，请重新选择模板')
  if (Object.keys(snapshot.doc.nodes).length + Object.keys(placement.layout.nodes).length + 1 > 10000) throw new Error('画布最多支持 10000 个对象，请减少线条后重试')
  const marks = [...(snapshot.doc.marks ?? []), ...(placement.layout.marks ?? [])]
  if (marks.length > MAX_REGION_MARKS) throw new Error(`画布最多支持 ${MAX_REGION_MARKS} 个标记块，请减少标记后重试`)
  if (marks.reduce((total, mark) => total + mark.rings.reduce((count, ring) => count + ring.length, 0), 0) > MAX_MARK_POINTS) throw new Error('区域轮廓过于复杂，请减少标记后重试')
  const groupId = crypto.randomUUID()
  const ids = new Map(Object.keys(placement.layout.nodes).map(id => [id, crypto.randomUUID()]))
  for (const source of Object.values(placement.layout.nodes)) {
    const node = structuredClone(source)
    node.id = ids.get(source.id)!
    node.parentId = source.parentId ? ids.get(source.parentId)! : groupId
    if (node.type === 'group') node.children = node.children.map(id => ids.get(id)!)
    snapshot.doc.nodes[node.id] = node
  }
  const box = placement.bounds, scale = placement.scale
  const matrix: Matrix = [scale, 0, 0, scale, center.x - (box.x + box.width / 2) * scale, center.y - (box.y + box.height / 2) * scale]
  snapshot.doc.nodes[groupId] = {
    id: groupId, type: 'group', name: placement.name, parentId: null, locked: false,
    matrix,
    children: placement.layout.roots.map(id => ids.get(id)!),
  }
  snapshot.doc.roots.push(groupId)
  snapshot.doc.marks = [...(snapshot.doc.marks ?? []), ...(placement.layout.marks ?? []).map(mark => ({
    ...structuredClone(mark), id: crypto.randomUUID(),
    groupId: mark.groupId ? ids.get(mark.groupId)! : groupId,
    rings: transformRings(mark.rings, matrix), label: apply(matrix, mark.label),
  }))]
  snapshot.scope = null
  snapshot.selected = [groupId]
}

export function squareOutline(): LineTemplate {
  const corners = [{ x: 0, y: 0 }, { x: 1000, y: 0 }, { x: 1000, y: 1000 }, { x: 0, y: 1000 }]
  const names = ['上边', '右边', '下边', '左边']
  const nodes = Object.fromEntries(corners.map((start, index) => {
    const id = `square-${index}`
    return [id, { id, type: 'line' as const, name: names[index], parentId: null, locked: false, matrix: identity(), start, end: corners[(index + 1) % corners.length] }]
  }))
  return { version: 1, width: 1000, height: 1000, nodes, roots: Object.keys(nodes) }
}
