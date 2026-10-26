import type { DocumentData, EditorNode } from '@/features/editor/model/types'
import { validateDocument } from './validation'

export type LineTemplate = {
  version: 1
  width: number
  height: number
  nodes: Record<string, EditorNode>
  roots: string[]
}

// Select only line/group fields so neither image data nor editing content is persisted.
export function lineTemplateFromDocument(source: DocumentData): LineTemplate {
  if (!source.image) throw new Error('请先导入图片')
  const doc = validateDocument({ version: 1, image: source.image, nodes: source.nodes, roots: source.roots, crop: null })
  const nodes: Record<string, EditorNode> = Object.fromEntries(Object.entries(doc.nodes).map(([id, node]): [string, EditorNode] => {
    const base = { id, name: node.name, parentId: node.parentId, matrix: node.matrix, locked: node.locked }
    return [id, node.type === 'group'
      ? { ...base, type: 'group', children: node.children }
      : { ...base, type: 'line', start: { x: node.start.x, y: node.start.y }, end: { x: node.end.x, y: node.end.y }, ...(node.splitAxis ? { splitAxis: node.splitAxis } : {}) }]
  }))
  return { version: 1, width: source.image.width, height: source.image.height, nodes, roots: doc.roots }
}

export function templateDocument(template: LineTemplate): DocumentData {
  return { version: 1, image: { id: 'template', name: '线条模板', width: template.width, height: template.height }, nodes: template.nodes, roots: template.roots, crop: null }
}

export function validateLineTemplate(value: unknown): LineTemplate {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('width' in value) || !('height' in value) || !('nodes' in value) || !('roots' in value)) {
    throw new Error('线条模板格式无效或版本不受支持')
  }
  const doc = validateDocument({ version: 1, image: { id: 'template', name: '线条模板', width: value.width, height: value.height }, nodes: value.nodes, roots: value.roots, crop: null })
  return lineTemplateFromDocument(doc)
}
