import type { Box, Point, RegionMark } from '@/features/editor/model/types'

export type SliceRegion = { id: number; rings: Point[][]; box: Box; area: number; label: Point }
export type SliceResult = { regions: SliceRegion[]; unusedEdges: number; area: Box }
export type SliceRequest = { lines: { start: Point; end: Point }[]; area: Box }
export type MarkedSliceRequest = { marks: RegionMark[]; area: Box }
export type SliceMode = 'all' | 'marked'
export type SliceResponse = { ok: true; result: SliceResult } | { ok: false; error: string }
