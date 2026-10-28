import { useId } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export type TemplateRange = 'all' | 'checked'

export function TemplateSaveRange({ value, onChange, total, checked, marks, checkedMarks, disabled }: {
  value: TemplateRange
  onChange: (value: TemplateRange) => void
  total: number
  checked: number
  marks: number
  checkedMarks: number
  disabled: boolean
}) {
  const id = useId()
  const options = [
    { value: 'all' as const, title: '全部内容', count: total, marks, description: '使用当前画布中的所有线条和标记块' },
    { value: 'checked' as const, title: '自选内容', count: checked, marks: checkedMarks, description: '在下方勾选需要的线条和标记块，预览同步更新' },
  ]
  return <fieldset className="space-y-3">
    <legend className="text-sm font-medium">保存范围</legend>
    <RadioGroup aria-label="模板内容范围" value={value} disabled={disabled} onValueChange={next => onChange(next === 'checked' ? 'checked' : 'all')}>
      {options.map(option => {
        const unavailable = disabled
        return <label key={option.value} htmlFor={`${id}-${option.value}`} className={cn(
          'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
          value === option.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
          unavailable && 'cursor-not-allowed border-dashed',
        )}>
          <RadioGroupItem id={`${id}-${option.value}`} value={option.value} disabled={unavailable} className="mt-0.5" />
          <span className="min-w-0 flex-1 space-y-1.5">
            <span className="flex items-center justify-between gap-3 text-sm font-medium"><span>{option.title}</span><span className="text-xs font-normal text-muted-foreground">{option.count} 条 · {option.marks} 块</span></span>
            <span className="block text-xs leading-5 text-muted-foreground">{option.description}</span>
          </span>
        </label>
      })}
    </RadioGroup>
  </fieldset>
}
