import { useEffect, useRef, useState } from 'react'
import { Download, FileArchive, ScanLine, Scissors } from 'lucide-react'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DocumentData } from '@/features/editor/model/types'
import { calculateSlices } from './calculate'
import { exportSlices } from './export'
import { SlicePreview } from './SlicePreview'
import { SliceRegionPicker } from './SliceRegionPicker'
import { SliceDownloadOptions } from './SliceDownloadOptions'
import type { SliceDownloadMode, SliceMode, SliceResult } from './types'
import { ExportSettings } from '@/features/export/ExportSettings'
import { createExportOptions, formatLabel, resolveFormat } from '@/lib/export/options'

export function SliceDialog({ doc, mode = 'all', onClose }: { doc: DocumentData; mode?: SliceMode; onClose: () => void }) {
  const [result, setResult] = useState<SliceResult | null>(null), [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set()), [exporting, setExporting] = useState(false), [progress, setProgress] = useState(0)
  const [downloadMode, setDownloadMode] = useState<SliceDownloadMode>('zip')
  const [options, setOptions] = useState(createExportOptions), [ready, setReady] = useState(false)
  const format = formatLabel(resolveFormat(options, doc.image?.name ?? 'image.png'))
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
    if (!result || !selected.size || !ready || exportingRef.current) return
    const regions = result.regions.filter(region => selected.has(region.id))
    const controller = new AbortController(); abort.current = controller
    exportingRef.current = true; setExporting(true); setProgress(0)
    try {
      await exportSlices(doc, regions, controller.signal, setProgress, downloadMode, options)
      toast.success(regions.length === 1 ? `已发起 ${format} 下载` : downloadMode === 'zip' ? '已发起 ZIP 下载' : `已发起 ${regions.length} 张图片下载`)
    } catch (value) { if (!controller.signal.aborted) toast.error(value instanceof Error ? value.message : '导出失败') }
    finally { exportingRef.current = false; setExporting(false) }
  }
  const close = () => { abort.current?.abort(); onClose() }
  return <Dialog open onOpenChange={value => { if (!value) close() }}><DialogContent className="flex flex-col overflow-hidden p-0 sm:max-w-7xl">
    <DialogHeader icon={mode === 'marked' ? <ScanLine /> : <Scissors />} className="gap-3 px-6 pt-6 pr-12">
      <DialogTitle>{mode === 'marked' ? '导出标记区域' : '按线切图'}</DialogTitle>
      <DialogDescription>{mode === 'marked' ? '每个标记区域保存为一张图片，保留原图颜色。' : '按线条围成的区域切图，每个区域保存为一张图片。'}</DialogDescription>
    </DialogHeader>
    <DialogBody className="gap-6 pb-6">
    {error ? <p role="alert" className="rounded-lg bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : !result ? <p role="status" className="py-16 text-center text-muted-foreground">正在计算切片…</p> : <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
      <SlicePreview doc={doc} result={result} selected={selected} marked={mode === 'marked'} />
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="rounded-md border px-2 py-1 font-medium text-foreground">{format}</span>
        <span className="rounded-md bg-muted px-2 py-1">{doc.crop ? '仅裁剪选区' : '整张图片'}</span>
        <span>{format === 'JPG' ? '不规则区域外填白' : '不规则区域外透明'}</span>
      </div>
      {!result.regions.length && <p role="status" className="text-sm text-muted-foreground">当前图片和裁剪范围内没有有效标记，请返回画布重新标记。</p>}
      <SliceRegionPicker regions={result.regions} selected={selected} disabled={exporting} onChange={setSelected} />
      {result.unusedEdges > 0 && <p className="text-xs text-muted-foreground">有未围成区域的线段，这些线段不参与切分。</p>}
      {mode === 'all' && result.regions.length === 1 && <p className="text-xs text-muted-foreground">还没有分出多个区域。请让线条连接图片边界，或围成封闭区域。</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-6 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        <ExportSettings sources={[doc.image?.name ?? 'image.png']} value={options} onChange={setOptions} disabled={exporting} onReady={setReady} />
        {selected.size > 1 && <SliceDownloadOptions value={downloadMode} disabled={exporting} onChange={setDownloadMode} />}
      </div>
    </div>}
    </DialogBody>
    <DialogFooter className="border-t px-6 py-4">
      {exporting && <span role="status" className="self-center text-xs tabular-nums text-muted-foreground sm:mr-auto">正在导出 {progress} / {selected.size}</span>}
      <Button variant="outline" onClick={close}>{exporting ? '取消导出' : '关闭'}</Button>
      <Button disabled={!result || !selected.size || !ready || exporting} onClick={() => void download()}>
        {selected.size > 1 && downloadMode === 'zip' ? <FileArchive /> : <Download />}
        {exporting ? '正在导出…' : selected.size <= 1 ? `确认下载 ${format}` : downloadMode === 'zip' ? '确认下载 ZIP' : `确认下载 ${selected.size} 张 ${format}`}
      </Button>
    </DialogFooter>
  </DialogContent></Dialog>
}
