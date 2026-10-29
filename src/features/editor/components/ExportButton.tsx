import { useState } from 'react'
import { Crop, Download, Image, ScanLine, Scissors } from 'lucide-react'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { exportImage } from '@/lib/export/image'
import { useEditor } from '../model/store'
import type { DocumentData } from '../model/types'
import { SliceDialog } from '@/features/slicing/SliceDialog'
import type { SliceMode } from '@/features/slicing/types'
import { ExportConfirmDialog } from '@/features/export/ExportConfirmDialog'
import type { ExportOptions } from '@/lib/export/options'
export function ExportButton({ disabled }: { disabled: boolean }) {
  const doc = useEditor(s => s.present.doc), [exporting, setExporting] = useState(false)
  const [sliceDoc, setSliceDoc] = useState<{ doc: DocumentData; mode: SliceMode } | null>(null)
  const [pending, setPending] = useState<{ doc: DocumentData; cropOnly: boolean } | null>(null)
  const openSlices = (mode: SliceMode) => setSliceDoc({ doc: structuredClone(doc), mode })
  const run = async (options: ExportOptions) => {
    if (!pending) return
    setExporting(true)
    try { await exportImage(pending.doc, pending.cropOnly, options); toast.success('已发起图片下载') }
    finally { setExporting(false) }
  }
  return <><DropdownMenu><DropdownMenuTrigger asChild><Button className="max-sm:size-9 max-sm:p-0 max-sm:has-[>svg]:px-0" aria-label={exporting ? '正在导出' : '导出'} disabled={disabled || !doc.image || exporting}><Download /><span className="hidden sm:inline">{exporting ? '正在导出' : '导出'}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
    <DropdownMenuItem disabled={!doc.marks?.length} onSelect={() => openSlices('marked')}><ScanLine />导出标记区域{doc.marks?.length ? ` · ${doc.marks.length} 块` : ''}</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => openSlices('all')}><Scissors />按线切图</DropdownMenuItem>
    <DropdownMenuItem disabled={!doc.crop} onSelect={() => setPending({ doc: structuredClone(doc), cropOnly: true })}><Crop />导出裁剪选区</DropdownMenuItem><DropdownMenuItem onSelect={() => setPending({ doc: structuredClone(doc), cropOnly: false })}><Image />导出完整图片</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>{sliceDoc && <SliceDialog doc={sliceDoc.doc} mode={sliceDoc.mode} onClose={() => setSliceDoc(null)} />}{pending && <ExportConfirmDialog sources={[pending.doc.image?.name ?? 'image.png']} onClose={() => setPending(null)} onConfirm={run} />}</>
}
