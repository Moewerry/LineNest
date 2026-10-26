import { segments } from '@/features/editor/geometry'
import type { DocumentData } from '@/features/editor/model/types'
import type { SliceResponse, SliceResult } from './types'

export function calculateSlices(doc: DocumentData, signal: AbortSignal): Promise<SliceResult> {
  return new Promise((resolve, reject) => {
    if (!doc.image) { reject(new Error('请先导入图片')); return }
    if (signal.aborted) { reject(new DOMException('已取消', 'AbortError')); return }
    const worker = new Worker(new URL('./slice.worker.ts', import.meta.url), { type: 'module' })
    const cleanup = () => { worker.terminate(); clearTimeout(timeout); signal.removeEventListener('abort', cancel) }
    const cancel = () => { cleanup(); reject(new DOMException('已取消', 'AbortError')) }
    const timeout = window.setTimeout(() => { cleanup(); reject(new Error('线条计算超时，请减少交点后重试')) }, 20000)
    signal.addEventListener('abort', cancel, { once: true })
    worker.onmessage = (event: MessageEvent<SliceResponse>) => {
      cleanup()
      event.data.ok ? resolve(event.data.result) : reject(new Error(event.data.error))
    }
    worker.onerror = () => { cleanup(); reject(new Error('切图计算失败，请重新打开切图预览')) }
    worker.postMessage({ lines: segments(doc), area: doc.crop ?? { x: 0, y: 0, width: doc.image.width, height: doc.image.height } })
  })
}
