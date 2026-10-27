import type { DocumentData } from './types'

export function lineIds(doc: DocumentData, ids = doc.roots): string[] {
  return ids.flatMap(id => {
    const node = doc.nodes[id]
    if (!node) return []
    return node.type === 'group' ? lineIds(doc, node.children) : [id]
  })
}

export function retainedChecks(doc: DocumentData, checked: string[]): string[] {
  return checked.filter(id => doc.nodes[id]?.type === 'line')
}
