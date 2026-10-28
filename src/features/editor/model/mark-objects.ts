import type { DocumentData, GroupNode, Snapshot } from './types'

export function isMarkObject(node: { type: string; kind?: string }) {
  return node.type === 'group' && node.kind === 'mark'
}

// Marks already follow their owning group during canvas transforms. Give each mark
// its own leaf group so it can use the same selection, locking and history logic.
export function normalizeMarkObjects(doc: DocumentData) {
  const marks = doc.marks ?? []
  for (const mark of marks) {
    const parent = mark.groupId ? doc.nodes[mark.groupId] : undefined
    if (parent && isMarkObject(parent)) continue
    const id = crypto.randomUUID()
    const node: GroupNode = { id, type: 'group', kind: 'mark', name: '色块', parentId: parent?.type === 'group' ? parent.id : null, locked: false, matrix: [1, 0, 0, 1, 0, 0], children: [] }
    doc.nodes[id] = node
    if (parent?.type === 'group') parent.children.push(id)
    else doc.roots.push(id)
    mark.groupId = id
  }
  const owners = new Set(marks.map(mark => mark.groupId))
  for (const node of Object.values(doc.nodes)) {
    if (!isMarkObject(node) || owners.has(node.id) || node.type !== 'group' || node.children.length) continue
    const parent = node.parentId ? doc.nodes[node.parentId] : undefined
    const siblings = parent?.type === 'group' ? parent.children : doc.roots
    const index = siblings.indexOf(node.id)
    if (index >= 0) siblings.splice(index, 1)
    delete doc.nodes[node.id]
  }
}

export function normalizeObjectSnapshot(snapshot: Snapshot) {
  normalizeMarkObjects(snapshot.doc)
  snapshot.selected = snapshot.selected.filter(id => !!snapshot.doc.nodes[id])
  if (snapshot.scope && !snapshot.doc.nodes[snapshot.scope]) snapshot.scope = null
}

export function orderMarksByObjects(doc: DocumentData) {
  const order = new Map<string, number>()
  const visit = (ids: string[]) => ids.forEach(id => {
    order.set(id, order.size)
    const node = doc.nodes[id]
    if (node?.type === 'group') visit(node.children)
  })
  visit(doc.roots)
  doc.marks?.sort((a, b) => (order.get(a.groupId ?? '') ?? 0) - (order.get(b.groupId ?? '') ?? 0))
}
