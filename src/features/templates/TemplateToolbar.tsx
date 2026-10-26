import { Download, Scissors, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function TemplateToolbar({ disabled, hasImage, onBatch, onImport, onExport }: {
  disabled: boolean
  hasImage: boolean
  onBatch: () => void
  onImport: () => void
  onExport: () => void
}) {
  return <div data-editor-settings className="flex shrink-0 items-center justify-between gap-3 px-4 pt-2 pb-3">
    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" disabled={disabled} onClick={onBatch}><Scissors />批量裁剪</Button>
    <div className="flex items-center gap-1">
      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" className="text-muted-foreground" disabled={disabled || !hasImage} aria-label="导入模板" onClick={onImport}><Upload /></Button></TooltipTrigger><TooltipContent side="bottom">导入模板</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" className="text-muted-foreground" disabled={disabled || !hasImage} aria-label="导出当前线条" onClick={onExport}><Download /></Button></TooltipTrigger><TooltipContent side="bottom">导出当前线条</TooltipContent></Tooltip>
    </div>
  </div>
}
