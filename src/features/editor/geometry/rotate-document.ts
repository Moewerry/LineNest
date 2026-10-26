import { multiply, normalizeSplitLines } from './index'
import type { DocumentData, ImageInfo, Matrix } from '../model/types'

export function rotateDocumentClockwise(doc: DocumentData, image: ImageInfo) {
  const previous = doc.image
  if (!previous || image.width !== previous.height || image.height !== previous.width) return
  const rotation: Matrix = [0, 1, -1, 0, previous.height, 0]
  // Rotate the document, including locked objects, while preserving group hierarchy.
  for (const id of doc.roots) doc.nodes[id].matrix = multiply(rotation, doc.nodes[id].matrix)
  for (const node of Object.values(doc.nodes)) {
    if (node.type !== 'line' || !node.splitAxis) continue
    const oldName = node.splitAxis === 'horizontal' ? '横向分割线' : '竖向分割线'
    node.splitAxis = node.splitAxis === 'horizontal' ? 'vertical' : 'horizontal'
    if (node.name === oldName) node.name = node.splitAxis === 'horizontal' ? '横向分割线' : '竖向分割线'
  }
  if (doc.crop) {
    const crop = doc.crop
    const x = Math.max(0, Math.min(image.width, previous.height - crop.y - crop.height))
    const y = Math.max(0, Math.min(image.height, crop.x))
    doc.crop = { x, y, width: Math.min(crop.height, image.width - x), height: Math.min(crop.width, image.height - y) }
  }
  doc.image = image
  normalizeSplitLines(doc)
}
