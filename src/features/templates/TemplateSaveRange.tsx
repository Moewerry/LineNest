import { useId } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export type TemplateRange = 'all' | 'checked'

export function TemplateSaveRange({ value, onChange, total, checked, disabled }: {
  value: TemplateRange
  onChange: (value: TemplateRange) => void
  total: number
  checked: number
  disabled: boolean
}) {
  const id = useId()
  const options = [
    { value: 'all' as const, title: '全部线条', count: total, description: '使用当前画布中的所有线条' },
    { value: 'checked' as const, title: '自选线条', count: checked, description: '在下方勾选需要的线条，预览同步更新' },
  ]
  return <fieldset className="space-y-3">
    <legend className="text-sm font-medium">线条范围</legend>
    <RadioGroup aria-label="模板线条范围" value={value} disabled={disabled} onValueChange={next => onChange(next === 'checked' ? 'checked' : 'all')}>
      {options.map(option => {
        const unavailable = disabled
        return <label key={option.value} htmlFor={`${id}-${option.value}`} className={cn(
          'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
          value === option.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
          unavailable && 'cursor-not-allowed opacity-50',
        )}>
          <RadioGroupItem id={`${id}-${option.value}`} value={option.value} disabled={unavailable} className="mt-0.5" />
          <span className="min-w-0 flex-1 space-y-1.5">
            <span className="flex items-center justify-between gap-3 text-sm font-medium"><span>{option.title}</span><span className="text-xs font-normal text-muted-foreground">{option.count} 条</span></span>
            <span className="block text-xs leading-5 text-muted-foreground">{option.description}</span>
          </span>
        </label>
      })}
    </RadioGroup>
  </fieldset>
}
