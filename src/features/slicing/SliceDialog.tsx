import { useEffect, useRef, useState } from 'react'
import { Download, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { DocumentData } from '@/features/editor/model/types'
import { calculateSlices } from './calculate'
import { exportSlices } from './export'
import { SlicePreview } from './SlicePreview'
import { SliceRegionPicker } from './SliceRegionPicker'
import type { SliceMode, SliceResult } from './types'

export function SliceDialog({ doc, mode = 'all', onClose }: { doc: DocumentData; mode?: SliceMode; onClose: () => void }) {
  const [result, setResult] = useState<SliceResult | null>(null), [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set()), [exporting, setExporting] = useState(false), [progress, setProgress] = useState(0)
  const abort = useRef<AbortController | null>(null), exportingRef = useRef(false)
  useEffect(() => {
    const controller = new AbortController()
    calculateSlices(doc, controller.signal, mode).then(value => {
      if (controller.signal.aborted) return
      setResult(value); setSelected(new Set(value.regions.map(region => region.id)))
    }).catch(value => { if (!controller.signal.aborted) setError(value instanceof Error ? value.message : '计算失败') })
    return () => { controller.abort(); abort.current?.abort() }
  }, [doc, mode])
  const download = async () => {
    if (!result || exportingRef.current) return
    const controller = new AbortController(); abort.current = controller
    exportingRef.current = true; setExporting(true); setProgress(0)
    try {
      await exportSlices(doc, result.regions.filter(region => selected.has(region.id)), controller.signal, setProgress)
      toast.success('切片已打包导出')
    } catch (value) { if (!controller.signal.aborted) toast.error(value instanceof Error ? value.message : '导出失败') }
    finally { exportingRef.current = false; setExporting(false) }
  }
  const close = () => { abort.current?.abort(); onClose() }
  return <Dialog open onOpenChange={value => { if (!value) close() }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
    <DialogHeader className="gap-3 pr-6">
      <DialogTitle className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Scissors className="size-[18px]" /></span>{mode === 'marked' ? '导出标记区域' : '按线切图'}</DialogTitle>
      <DialogDescription>{mode === 'marked' ? '每个标记区域保存为一张图片，保留原图颜色。' : '按线条围成的区域切图，每个区域保存为一张图片。'}</DialogDescription>
    </DialogHeader>
    {error ? <p role="alert" className="rounded-lg bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : !result ? <p role="status" className="py-16 text-center text-muted-foreground">正在计算切片…</p> : <>
      <SlicePreview doc={doc} result={result} selected={selected} marked={mode === 'marked'} />
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="rounded-md border px-2 py-1 font-medium text-foreground">PNG</span>
        <span className="rounded-md bg-muted px-2 py-1">{doc.crop ? '仅裁剪选区' : '整张图片'}</span>
        <span>不规则区域外透明</span>
      </div>
      {!result.regions.length && <p role="status" className="text-sm text-muted-foreground">当前图片和裁剪范围内没有有效标记，请返回画布重新标记。</p>}
      <SliceRegionPicker regions={result.regions} selected={selected} disabled={exporting} onChange={setSelected} />
      {result.unusedEdges > 0 && <p className="text-xs text-muted-foreground">有未围成区域的线段，这些线段不参与切分。</p>}
      {mode === 'all' && result.regions.length === 1 && <p className="text-xs text-muted-foreground">还没有分出多个区域。请让线条连接图片边界，或围成封闭区域。</p>}
    </>}
    <Separator />
    <DialogFooter><Button variant="outline" onClick={close}>{exporting ? '取消导出' : '关闭'}</Button><Button disabled={!result || !selected.size || exporting} onClick={() => void download()}><Download />{exporting ? `正在导出 ${progress}/${selected.size}` : '下载 ZIP'}</Button></DialogFooter>
  </DialogContent></Dialog>
}
