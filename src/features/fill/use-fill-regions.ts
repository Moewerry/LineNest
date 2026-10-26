import { useEffect, useMemo, useRef, useState } from 'react'
import { segments } from '@/features/editor/geometry'
import type { DocumentData } from '@/features/editor/model/types'
import { calculateSlices } from '@/features/slicing/calculate'
import type { SliceResult } from '@/features/slicing/types'

type Result = { key: string; result: SliceResult | null; error: string }

export function useFillRegions(doc: DocumentData, enabled: boolean) {
  const key = useMemo(() => JSON.stringify({ image: doc.image, crop: doc.crop, lines: segments(doc) }), [doc])
  const latestDoc = useRef(doc)
  latestDoc.current = doc
  const [state, setState] = useState<Result | null>(null)
  useEffect(() => {
    if (!enabled || !latestDoc.current.image || (state?.key === key && state.result)) return
    const controller = new AbortController()
    const source = latestDoc.current
    calculateSlices(source, controller.signal).then(result => {
      if (!controller.signal.aborted) setState({ key, result, error: '' })
    }).catch(error => {
      if (!controller.signal.aborted) setState({ key, result: null, error: error instanceof Error ? error.message : '区域识别失败，请调整分割线' })
    })
    return () => controller.abort()
  }, [key, enabled])
  const current = state?.key === key ? state : null
  return { regions: current?.result?.regions ?? [], loading: enabled && !current?.result && !current?.error, error: enabled ? current?.error ?? '' : '', ready: enabled && !!current?.result }
}
