import { Download, MoreHorizontal, Scissors, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SaveTemplateButton } from './SaveTemplateButton'

export function TemplateToolbar({ disabled, hasImage, onBatch, onImport, onExport }: {
  disabled: boolean
  hasImage: boolean
  onBatch: () => void
  onImport: () => void
  onExport: () => void
}) {
  return <div data-editor-settings className="flex shrink-0 items-center justify-between gap-3 px-4 pb-4">
    <SaveTemplateButton disabled={disabled} />
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" disabled={disabled} aria-label="模板管理"><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!hasImage} onSelect={onImport}><Upload />导入模板</DropdownMenuItem>
        <DropdownMenuItem disabled={!hasImage} onSelect={onExport}><Download />导出当前线条</DropdownMenuItem>
        <DropdownMenuItem onSelect={onBatch}><Scissors />前往批量裁剪</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
}
