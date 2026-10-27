import { useState } from 'react'
import { segments } from '@/features/editor/geometry'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { batchDocument } from './document'
import { BatchPreviewOverlay } from './BatchPreviewOverlay'
import { BatchPreviewLine } from './BatchPreviewLine'
import { BatchTemplateLayers } from './BatchTemplateLayers'
import { BatchCropPreview } from './BatchCropPreview'
import { findBuiltinTemplate } from '@/features/templates/builtins'
import type { Point } from '@/features/editor/model/types'
import type { BatchFit, BatchItem, BatchTemplate } from './types'

export function BatchPreview({ item, templates, fit, disabled, running, status, total, onDownload, onEdit, onOffset, onLineOffset, onReset }: {
  item: BatchItem; templates: BatchTemplate[]; fit: BatchFit; disabled: boolean
  running: boolean; status: string; total?: number; onDownload: () => void
  onEdit: () => void; onReset: (id: string, templateId: string) => void
  onLineOffset: (id: string, lineId: string, offset: Point) => void
  onOffset: (id: string, templateId: string, axis: 'offsetX' | 'offsetY', value: number) => void
}) {
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(() => templates.length === 1 ? templates[0].id : null)
  const currentTemplate = templates.find(template => template.id === activeTemplateId)
  const previewDoc = batchDocument(item, currentTemplate ? [currentTemplate] : templates, fit)
  const lines = segments(previewDoc)
  const squareSelected = !!currentTemplate && !!findBuiltinTemplate(currentTemplate.id)
  const offset = currentTemplate ? item.templateOffsets?.[currentTemplate.id] ?? { x: 0, y: 0 } : { x: 0, y: 0 }
  const hasChanges = !!currentTemplate && (!!offset.x || !!offset.y || Object.keys(currentTemplate.layout.nodes).some(nodeId => {
    const lineOffset = item.lineOffsets?.[JSON.stringify([currentTemplate.id, nodeId])]
    return lineOffset && (lineOffset.x || lineOffset.y)
  }))
  return <section className="min-w-0 space-y-5 rounded-2xl border bg-card p-5" aria-label="裁剪预览">
    <div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold">预览</h2><span className="truncate text-xs text-muted-foreground">{templates.length > 1 ? `${templates.length} 个模板 · 线条叠加` : templates[0]?.name ?? '请选择模板'}</span></div>
    {templates.length > 0 && <BatchTemplateLayers templates={templates} active={currentTemplate?.id ?? null} disabled={disabled} onSelect={setActiveTemplateId} />}
    <div aria-busy={running} className="canvas-surface relative isolate flex min-h-64 items-center justify-center overflow-hidden rounded-xl border p-6">
      <svg viewBox={`0 0 ${item.width} ${item.height}`} className="max-h-[50vh] w-full" style={{ aspectRatio: `${item.width} / ${item.height}` }} role="img" aria-label={`${item.file.name} 的裁剪线预览`}>
        <image href={item.url} width={item.width} height={item.height} />
        {previewDoc.crop && <BatchCropPreview crop={previewDoc.crop} width={item.width} height={item.height} />}
        {lines.map(line => <BatchPreviewLine key={`${item.id}:${fit}:${currentTemplate?.id ?? 'all'}:${line.id}`} line={line} offset={item.lineOffsets?.[line.id] ?? { x: 0, y: 0 }} disabled={disabled || !currentTemplate} onMove={offset => onLineOffset(item.id, line.id, offset)} />)}
      </svg>
      <BatchPreviewOverlay running={running} status={status} total={total} onDownload={onDownload} onEdit={onEdit} />
    </div>
    {templates.length > 0 && <Collapsible className="rounded-xl border">
      <CollapsibleTrigger asChild><Button variant="ghost" className="h-11 w-full justify-between px-4 text-xs [&[data-state=open]_svg]:rotate-180">调整模板位置<ChevronDown className="size-4 transition-transform" /></Button></CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 border-t p-4">
      <div className="flex flex-wrap items-end gap-4">
      <label className="space-y-1 text-xs">左右移动（像素）<Input type="number" className="w-32" min={-16384} max={16384} step={1} disabled={disabled || !currentTemplate} value={offset.x} onChange={e => { if (currentTemplate) onOffset(item.id, currentTemplate.id, 'offsetX', Number(e.target.value)) }} /></label>
      <label className="space-y-1 text-xs">上下移动（像素）<Input type="number" className="w-32" min={-16384} max={16384} step={1} disabled={disabled || !currentTemplate} value={offset.y} onChange={e => { if (currentTemplate) onOffset(item.id, currentTemplate.id, 'offsetY', Number(e.target.value)) }} /></label>
      <Button size="sm" variant="ghost" disabled={disabled || !hasChanges} onClick={() => { if (currentTemplate) onReset(item.id, currentTemplate.id) }}>重置当前模板位置</Button>
    </div>
    <p className="text-xs leading-6 text-muted-foreground">{squareSelected ? '输入位移可调整正方形选区，范围始终限制在原图内，尺寸保持 1:1。' : currentTemplate ? `正在编辑「${currentTemplate.name}」：拖动线条或输入位移，仅影响当前图片的此模板。` : '在预览上方选择单个模板后可调整位置，其他模板的线条将隐藏。'}批量裁剪使用全部已选模板。</p>
    </CollapsibleContent></Collapsible>}
    {item.error && <p role="alert" className="break-words text-sm text-destructive">{item.error}</p>}
  </section>
}
