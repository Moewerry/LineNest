import { polygonize } from './polygonize'
import type { SliceRequest, SliceResponse } from './types'

const worker = self as unknown as {
  onmessage: ((event: MessageEvent<SliceRequest>) => void) | null
  postMessage: (response: SliceResponse) => void
}
worker.onmessage = event => {
  try { worker.postMessage({ ok: true, result: polygonize(event.data) }) }
  catch (error) { worker.postMessage({ ok: false, error: error instanceof Error ? error.message : '无法计算切片，请检查线条交点' }) }
}
