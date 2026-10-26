import { Check, Download, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BatchPreviewOverlay({ running, status, total, onDownload }: {
  running: boolean; status: string; total?: number; onDownload: () => void
}) {
  if (!running && !total) return null

  return <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/60 p-6 text-center backdrop-blur-sm">
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
      {running
        ? <LoaderCircle aria-hidden="true" className="size-12 animate-spin text-primary" strokeWidth={2.5} />
        : <Check aria-hidden="true" className="size-10 text-primary" />}
      <p className="text-sm font-medium">{status}</p>
    </div>
    {!running && total && <Button className="h-11 gap-2 px-6" onClick={onDownload}><Download />下载 ZIP</Button>}
  </div>
}
