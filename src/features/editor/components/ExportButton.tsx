import { useState } from 'react'
import { Download, PaintBucket, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { exportImage } from '@/lib/export/image'
import { useEditor } from '../model/store'
import type { DocumentData } from '../model/types'
import { SliceDialog } from '@/features/slicing/SliceDialog'
import type { SliceMode } from '@/features/slicing/types'
export function ExportButton({ disabled }: { disabled: boolean }) {
  const doc = useEditor(s => s.present.doc), [exporting, setExporting] = useState(false)
  const [sliceDoc, setSliceDoc] = useState<{ doc: DocumentData; mode: SliceMode } | null>(null)
  const openSlices = (mode: SliceMode) => setSliceDoc({ doc: structuredClone(doc), mode })
  const run = async (cropOnly: boolean) => {
    setExporting(true)
    try { await exportImage(structuredClone(doc), cropOnly); toast.success('已导出') }
    catch (error) { toast.error(error instanceof Error ? error.message : '导出失败') }
    finally { setExporting(false) }
  }
  return <><DropdownMenu><DropdownMenuTrigger asChild><Button disabled={disabled || !doc.image || exporting}><Download />{exporting ? '正在导出' : '导出'}</Button></DropdownMenuTrigger><DropdownMenuContent align="end">
    <DropdownMenuItem disabled={!doc.marks?.length} onSelect={() => openSlices('marked')}><PaintBucket />导出已标记区域{doc.marks?.length ? ` · ${doc.marks.length} 块` : ''}</DropdownMenuItem>
    <DropdownMenuItem onSelect={() => openSlices('all')}><Scissors />按线切图 / 下载 ZIP</DropdownMenuItem>
    <DropdownMenuItem disabled={!doc.crop} onSelect={() => void run(true)}>导出选区 PNG</DropdownMenuItem><DropdownMenuItem onSelect={() => void run(false)}>导出原图 PNG</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>{sliceDoc && <SliceDialog doc={sliceDoc.doc} mode={sliceDoc.mode} onClose={() => setSliceDoc(null)} />}</>
}
