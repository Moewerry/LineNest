import { useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createExportOptions, type ExportOptions } from '@/lib/export/options'
import { ExportSettings } from './ExportSettings'

export function ExportConfirmDialog({ sources, onClose, onConfirm }: { sources: string[]; onClose: () => void; onConfirm: (options: ExportOptions) => Promise<void> }) {
  const [options, setOptions] = useState(createExportOptions), [ready, setReady] = useState(false), [busy, setBusy] = useState(false)
  const working = useRef(false)
  const confirm = async () => {
    if (!ready || working.current) return
    working.current = true; setBusy(true)
    try { await onConfirm(options); onClose() }
    catch (error) { toast.error(error instanceof Error ? error.message : '导出失败') }
    finally { working.current = false; setBusy(false) }
  }
  return <Dialog open onOpenChange={open => { if (!open && !working.current) onClose() }}><DialogContent showCloseButton={!busy}>
    <DialogHeader icon={<Download />}><DialogTitle>确认下载</DialogTitle><DialogDescription>选择导出格式和文件名，确认后开始下载。</DialogDescription></DialogHeader>
    <ExportSettings sources={sources} value={options} onChange={setOptions} disabled={busy} onReady={setReady} />
    <DialogFooter><Button variant="outline" disabled={busy} onClick={onClose}>取消</Button><Button disabled={!ready || busy} onClick={() => void confirm()}>{busy ? '正在导出…' : '确认下载'}</Button></DialogFooter>
  </DialogContent></Dialog>
}
