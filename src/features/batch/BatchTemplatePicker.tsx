import { BatchTemplateCard } from './BatchTemplateCard'
import { BatchFitSettings } from './BatchFitSettings'
import type { BatchFit, BatchTemplate } from './types'
import { findBuiltinTemplate } from '@/features/templates/builtins'
import { BuiltinTemplateCard } from '@/features/templates/BuiltinTemplateCard'

export function BatchTemplatePicker({ templates, selected, fit, disabled, onToggle, onFit }: {
  templates: BatchTemplate[]; selected: string[]; fit: BatchFit; disabled: boolean
  onToggle: (id: string) => void; onFit: (fit: BatchFit) => void
}) {
  const selectedCount = templates.filter(template => selected.includes(template.id)).length
  const builtins = templates.filter(template => findBuiltinTemplate(template.id))
  const mine = templates.filter(template => !findBuiltinTemplate(template.id))
  const hasMarks = templates.some(template => selected.includes(template.id) && !!template.layout.marks?.length)
  return <section className="space-y-5" aria-label="选择模板">
    <div className="space-y-4">
      <div><h2 className="text-sm font-semibold">内置模板</h2><p className="mt-1.5 text-xs leading-5 text-muted-foreground">按每张原图自动计算裁剪范围，不受下方尺寸适配影响。</p></div>
      <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3">{builtins.map(template => {
        const builtin = findBuiltinTemplate(template.id)!
        return <BuiltinTemplateCard key={template.id} template={builtin} selected={selected.includes(template.id)} disabled={disabled} onSelect={() => onToggle(template.id)} />
      })}</div>
    </div>
    <div className="space-y-4 border-t border-[var(--workspace-divider)] pt-5">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold">我的模板 <span className="ml-1 text-xs font-normal text-muted-foreground">{mine.length}</span></h2>
      <p role="status" className="text-xs text-muted-foreground">已选 {selectedCount} 个</p>
    </div>
    {mine.length > 0 && <BatchFitSettings fit={fit} disabled={disabled} onFit={onFit} />}
    <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3">
      {mine.map(template => <BatchTemplateCard key={template.id} template={template} selected={selected.includes(template.id)} disabled={disabled} onToggle={() => onToggle(template.id)} />)}
    </div>
    {!mine.length && <p className="rounded-xl border border-dashed p-5 text-sm leading-6 text-muted-foreground">还没有自定义模板。可以先使用上方内置模板，或导入、保存自己的线条和标记块模板。</p>}
    {(selectedCount > 1 || hasMarks) && <p className="text-xs leading-6 text-muted-foreground">{hasMarks ? '已选模板包含标记块，将仅裁剪全部已选模板中的标记区域，每块导出一张图片。' : '多选时会叠加线条。'}选中正方形模板后，仅导出正方形范围内的区域。</p>}
    </div>
  </section>
}
