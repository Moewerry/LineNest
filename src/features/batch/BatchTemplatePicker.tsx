import { BatchTemplateCard } from './BatchTemplateCard'
import { BatchFitSettings } from './BatchFitSettings'
import type { BatchFit, BatchTemplate } from './types'

export function BatchTemplatePicker({ templates, selected, fit, disabled, onToggle, onFit }: {
  templates: BatchTemplate[]; selected: string[]; fit: BatchFit; disabled: boolean
  onToggle: (id: string) => void; onFit: (fit: BatchFit) => void
}) {
  const selectedCount = templates.filter(template => selected.includes(template.id)).length
  return <section className="space-y-5" aria-label="选择模板">
    <BatchFitSettings fit={fit} disabled={disabled} onFit={onFit} />
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold">我的模板 <span className="ml-1 text-xs font-normal text-muted-foreground">{templates.length}</span></h2>
      <p role="status" className="text-xs text-muted-foreground">多选叠加线条<span className="mx-2 text-border">/</span><span className={selectedCount ? 'text-primary' : undefined}>已选 {selectedCount} 个</span></p>
    </div>
    <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map(template => <BatchTemplateCard key={template.id} template={template} selected={selected.includes(template.id)} disabled={disabled} onToggle={() => onToggle(template.id)} />)}
    </div>
  </section>
}
