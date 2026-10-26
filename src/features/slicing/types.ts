import type { Box, Point } from '@/features/editor/model/types'

export type SliceRegion = { id: number; rings: Point[][]; box: Box; area: number; label: Point }
export type SliceResult = { regions: SliceRegion[]; unusedEdges: number; area: Box }
export type SliceRequest = { lines: { start: Point; end: Point }[]; area: Box }
export type SliceResponse = { ok: true; result: SliceResult } | { ok: false; error: string }
