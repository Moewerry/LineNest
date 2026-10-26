import { useEffect, useRef, useState } from 'react'
import { Check, Download, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { DocumentData } from '@/features/editor/model/types'
import { calculateSlices } from './calculate'
import { exportSlices } from './export'
import { SlicePreview } from './SlicePreview'
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
    <DialogHeader><DialogTitle className="flex items-center gap-2"><Scissors className="size-4" />{mode === 'marked' ? '已标记区域预览' : '切图预览'}</DialogTitle><DialogDescription>{mode === 'marked' ? '每个标记区域单独裁成一张图片，颜色只作提示，不写入导出图片。' : '按实际线段切分，短线不会自动延长。'}{doc.crop ? '仅处理裁剪选区。' : '处理整张图片。'}非矩形区域导出为透明 PNG。</DialogDescription></DialogHeader>
    {error ? <p role="alert" className="rounded-lg bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : !result ? <p role="status" className="py-16 text-center text-muted-foreground">正在计算切片…</p> : <>
      <SlicePreview doc={doc} result={result} selected={selected} marked={mode === 'marked'} />
      {!result.regions.length && <p role="status" className="text-sm text-muted-foreground">当前图片和裁剪范围内没有有效标记，请返回画布重新标记。</p>}
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{result.regions.length} 个区域 · 已选 {selected.size} 个</span><Button size="sm" variant="ghost" disabled={exporting} onClick={() => setSelected(selected.size === result.regions.length ? new Set() : new Set(result.regions.map(region => region.id)))}>{selected.size === result.regions.length ? '取消全选' : '全选'}</Button></div>
      <ScrollArea className="max-h-36"><div className="flex flex-wrap gap-2 p-1">{result.regions.map(region => <Button key={region.id} variant="outline" size="sm" aria-pressed={selected.has(region.id)} disabled={exporting} className={cn('text-xs', selected.has(region.id) && 'border-ring/30 bg-accent')} onClick={() => setSelected(current => { const next = new Set(current); next.has(region.id) ? next.delete(region.id) : next.add(region.id); return next })}>{selected.has(region.id) && <Check className="size-3" />}#{region.id} · {region.box.width} × {region.box.height}</Button>)}</div></ScrollArea>
      {result.unusedEdges > 0 && <p className="text-xs text-muted-foreground">有未围成区域的线段，这些线段不参与切分。</p>}
      {mode === 'all' && result.regions.length === 1 && <p className="text-xs text-muted-foreground">还没有分出多个区域。请让线条连接图片边界，或围成封闭区域。</p>}
    </>}
    <DialogFooter><Button variant="outline" onClick={close}>{exporting ? '取消导出' : '关闭'}</Button><Button disabled={!result || !selected.size || exporting} onClick={() => void download()}><Download />{exporting ? `正在导出 ${progress}/${selected.size}` : '下载 ZIP'}</Button></DialogFooter>
  </DialogContent></Dialog>
}
