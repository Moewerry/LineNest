import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink, FolderOpen, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SaveTemplateButton } from '@/features/templates/SaveTemplateButton'
import { BatchTemplatePicker } from './BatchTemplatePicker'
import type { BatchFit, BatchTemplate } from './types'

export function BatchTemplatesDialog({ open, onOpenChange, templates, selected, fit, disabled, loading, error, onToggle, onFit, onImport, onConfirm }: {
  open: boolean; onOpenChange: (open: boolean) => void; templates: BatchTemplate[]; selected: string[]; fit: BatchFit
  disabled: boolean; loading: boolean; error: string; onToggle: (id: string) => void; onFit: (fit: BatchFit) => void; onImport: () => void
  onConfirm: () => void
}) {
  const selectedCount = templates.filter(template => selected.includes(template.id)).length
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-3xl">
    <DialogHeader icon={<FolderOpen />} className="border-b px-6 py-5 text-left"><DialogTitle className="text-lg">选择模板</DialogTitle><DialogDescription className="sr-only">选择尺寸适配方式和模板；含标记块时按标记区域裁剪，否则叠加线条裁剪。</DialogDescription></DialogHeader>
    <div className="min-h-0 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" disabled={disabled} onClick={onImport} className="shadow-none"><Upload />导入模板</Button>
      <SaveTemplateButton disabled={disabled} />
      <Button asChild variant="ghost" className="text-muted-foreground"><Link to="/editor" target="_blank" rel="noopener noreferrer"><ExternalLink />新标签页画线</Link></Button>
    </div>
    {loading && <p role="status" className="text-sm text-muted-foreground">正在读取我的模板…</p>}
    {error && <p role="alert" className="text-sm text-destructive">我的模板读取失败：{error}，仍可使用内置模板。</p>}
    <BatchTemplatePicker templates={templates} selected={selected} fit={fit} disabled={disabled} onToggle={onToggle} onFit={onFit} />
    </div>
    <DialogFooter className="items-center justify-between gap-3 border-t bg-secondary/30 px-6 py-4 sm:justify-between">
      <span className="text-xs text-muted-foreground">{selectedCount ? `已选 ${selectedCount} 个模板` : '请选择模板'}</span>
      <Button disabled={disabled || !selectedCount} onClick={() => { onConfirm(); onOpenChange(false) }} className="w-full gap-3 rounded-lg sm:w-auto">完成选择<ArrowRight className="size-4" /></Button>
    </DialogFooter>
  </DialogContent></Dialog>
}
