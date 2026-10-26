import type { DocumentData } from '@/features/editor/model/types'
import { validRegionMarks } from '@/features/fill/validation'

const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) < 1e9
const point = (v: unknown) => record(v) && finite(v.x) && finite(v.y)
const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 300
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(text)
const fail = (): never => { throw new Error('模板格式无效或版本不受支持') }

export function validateDocument(value: unknown): DocumentData {
  if (!record(value) || value.version !== 1 || !record(value.nodes) || !strings(value.roots)) return fail()
  if (value.marks !== undefined && !validRegionMarks(value.marks)) return fail()
  const image = value.image
  if (!record(image) || !text(image.id) || !text(image.name) || !finite(image.width) || !finite(image.height) || image.width <= 0 || image.height <= 0) return fail()
  if (value.crop !== null) {
    const b = value.crop
    if (!record(b) || !point(b) || !finite(b.width) || !finite(b.height) || b.width < 1 || b.height < 1 || (b.x as number) < 0 || (b.y as number) < 0 || (b.x as number) + b.width > image.width || (b.y as number) + b.height > image.height) return fail()
  }
  const nodes = value.nodes, ids = Object.keys(nodes)
  if (ids.length > 10000) throw new Error('模板最多支持 10000 个对象')
  for (const id of ids) {
    const n = nodes[id]
    if (!record(n) || n.id !== id || !text(id) || !text(n.name) || (n.parentId !== null && !text(n.parentId)) || typeof n.locked !== 'boolean') return fail()
    const m = n.matrix
    if (!Array.isArray(m) || m.length !== 6 || !m.every(finite) || Math.abs(m[0] * m[3] - m[1] * m[2]) < 1e-12) return fail()
    if (n.type === 'line') {
      if (!point(n.start) || !point(n.end)) return fail()
      if (n.splitAxis !== undefined && n.splitAxis !== 'horizontal' && n.splitAxis !== 'vertical') return fail()
    }
    else if (n.type === 'group') { if (!strings(n.children)) return fail() }
    else return fail()
  }
  const visited = new Set<string>()
  const visit = (id: string, parent: string | null, depth: number) => {
    const n = nodes[id]
    if (!record(n) || n.parentId !== parent || visited.has(id) || depth > 64) return fail()
    visited.add(id)
    if (n.type === 'group') (n.children as string[]).forEach(child => visit(child, id, depth + 1))
  }
  value.roots.forEach(id => visit(id, null, 0))
  if (visited.size !== ids.length) return fail()
  return structuredClone(value) as unknown as DocumentData
}
