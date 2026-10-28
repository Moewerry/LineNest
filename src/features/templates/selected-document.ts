import type { DocumentData, EditorNode } from '@/features/editor/model/types'

export function selectedTemplateDocument(source: DocumentData, ids: string[], markIds?: string[]): DocumentData {
  const selected = new Set(ids), nodes: Record<string, EditorNode> = {}
  const visit = (id: string): boolean => {
    const node = source.nodes[id]
    if (!node) return false
    if (node.type === 'line') {
      if (!selected.has(id)) return false
      nodes[id] = structuredClone(node)
      return true
    }
    const children = node.children.filter(visit)
    const hasMarks = source.marks?.some(mark => mark.groupId === id && (!markIds || markIds.includes(mark.id)))
    if (!children.length && !hasMarks) return false
    // Keep ancestor transforms so checked lines retain their canvas positions.
    nodes[id] = { ...structuredClone(node), children }
    return true
  }
  const roots = source.roots.filter(visit)
  const marks = (source.marks ?? []).filter(mark => !markIds || markIds.includes(mark.id)).map(mark => structuredClone(mark))
  if (!roots.length && !marks.length) throw new Error('请先勾选线条或标记块')
  return { version: 1, image: source.image, nodes, roots, crop: null, marks }
}
