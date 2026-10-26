import { polygonize } from './polygonize'
import type { MarkedSliceRequest, SliceRequest, SliceResponse } from './types'
import { sliceMarkedRegions } from '@/features/fill/marked-slices'

const worker = self as unknown as {
  onmessage: ((event: MessageEvent<SliceRequest | MarkedSliceRequest>) => void) | null
  postMessage: (response: SliceResponse) => void
}
worker.onmessage = event => {
  try { worker.postMessage({ ok: true, result: 'marks' in event.data ? sliceMarkedRegions(event.data.marks, event.data.area) : polygonize(event.data) }) }
  catch (error) { worker.postMessage({ ok: false, error: error instanceof Error ? error.message : '无法计算切片，请检查线条交点' }) }
}
