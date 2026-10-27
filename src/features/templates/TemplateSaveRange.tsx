import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type TemplateRange = 'all' | 'checked'

export function TemplateSaveRange({ value, onChange, total, checked, disabled }: {
  value: TemplateRange
  onChange: (value: TemplateRange) => void
  total: number
  checked: number
  disabled: boolean
}) {
  return <Tabs value={value} onValueChange={next => onChange(next === 'checked' ? 'checked' : 'all')}>
    <TabsList aria-label="模板保存范围" className="w-full">
      <TabsTrigger value="all" disabled={disabled}>全部线条（{total}）</TabsTrigger>
      <TabsTrigger value="checked" disabled={disabled || !checked}>已选对象（{checked}）</TabsTrigger>
    </TabsList>
  </Tabs>
}
