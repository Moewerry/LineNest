import type { RegionMark } from '@/features/editor/model/types'
import { MAX_MARK_POINTS, MAX_REGION_MARKS } from './constants'

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const coordinate = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) < 1e9
const point = (value: unknown) => record(value) && coordinate(value.x) && coordinate(value.y)

export function validRegionMarks(value: unknown): value is RegionMark[] {
  if (!Array.isArray(value) || value.length > MAX_REGION_MARKS) return false
  const ids = new Set<string>()
  let vertices = 0
  for (const mark of value) {
    if (!record(mark) || typeof mark.id !== 'string' || !mark.id.length || mark.id.length > 300 || ids.has(mark.id)) return false
    ids.add(mark.id)
    if (mark.groupId !== undefined && (typeof mark.groupId !== 'string' || !mark.groupId.length || mark.groupId.length > 300)) return false
    if (typeof mark.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(mark.color) || typeof mark.opacity !== 'number' || !Number.isFinite(mark.opacity) || mark.opacity < 0 || mark.opacity > 1 || !point(mark.label)) return false
    if (!Array.isArray(mark.rings) || !mark.rings.length) return false
    for (const ring of mark.rings) {
      if (!Array.isArray(ring) || ring.length < 3) return false
      vertices += ring.length
      if (vertices > MAX_MARK_POINTS || !ring.every(point)) return false
    }
  }
  return true
}
