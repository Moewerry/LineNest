import type { DocumentData } from './types'
import { isMarkObject } from './mark-objects'

export function lineIds(doc: DocumentData, ids = doc.roots): string[] {
  return ids.flatMap(id => {
    const node = doc.nodes[id]
    if (!node) return []
    return node.type === 'group' ? lineIds(doc, node.children) : [id]
  })
}

export function retainedChecks(doc: DocumentData, checked: string[]): string[] {
  return checked.filter(id => {
    const node = doc.nodes[id]
    return node && (node.type === 'line' || isMarkObject(node))
  })
}

export function objectIds(doc: DocumentData, ids = doc.roots): string[] {
  return ids.flatMap(id => {
    const node = doc.nodes[id]
    if (!node) return []
    return node.type === 'group' && !isMarkObject(node) ? objectIds(doc, node.children) : [id]
  })
}
