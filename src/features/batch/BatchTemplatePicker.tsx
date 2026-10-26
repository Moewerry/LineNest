import { Button } from '@/components/ui/button'
import { TemplateThumbnail } from '@/features/templates/TemplateThumbnail'
import type { BatchFit, BatchTemplate } from './types'

export function BatchTemplatePicker({ templates, selected, fit, disabled, onToggle, onFit }: {
  templates: BatchTemplate[]; selected: string[]; fit: BatchFit; disabled: boolean
  onToggle: (id: string) => void; onFit: (fit: BatchFit) => void
}) {
  return <section className="space-y-4" aria-label="选择模板">
    <h2 className="text-base font-semibold">选择模板 <span className="text-xs font-normal text-muted-foreground">可多选</span></h2>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map(template => <Button key={template.id} variant="outline" disabled={disabled} aria-pressed={selected.includes(template.id)} onClick={() => onToggle(template.id)} className={`h-auto justify-start gap-3 p-3 text-left ${selected.includes(template.id) ? 'border-primary bg-primary/5' : ''}`}>
        <TemplateThumbnail layout={template.layout} />
        <span className="min-w-0"><span className="block truncate">{template.name}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{template.layout.width} × {template.layout.height}{selected.includes(template.id) ? ' · 已选' : ''}</span></span>
      </Button>)}
    </div>
    <div className="flex flex-wrap gap-2" role="group" aria-label="尺寸适配">
      <Button size="sm" variant={fit === 'relative' ? 'default' : 'outline'} aria-pressed={fit === 'relative'} disabled={disabled} onClick={() => onFit('relative')}>按图片比例适配</Button>
      <Button size="sm" variant={fit === 'original' ? 'default' : 'outline'} aria-pressed={fit === 'original'} disabled={disabled} onClick={() => onFit('original')}>保留模板原尺寸</Button>
    </div>
    <p className="text-xs text-muted-foreground">{fit === 'relative' ? '线条随图片宽高缩放，图片不变形。' : '线条保留原坐标，超出图片的部分不裁。'}</p>
  </section>
}
