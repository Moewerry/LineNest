import { Maximize2, Ratio } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { BatchFit } from './types'

export function BatchFitSettings({ fit, disabled, onFit }: { fit: BatchFit; disabled: boolean; onFit: (fit: BatchFit) => void }) {
  return <section aria-label="尺寸适配" className="rounded-xl bg-secondary/50 p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-medium">尺寸适配</h3><span className="text-[11px] text-muted-foreground">应用于所有已选模板</span></div>
    <Tabs value={fit} onValueChange={value => { if (value === 'relative' || value === 'original') onFit(value) }} className="gap-3">
      <TabsList aria-label="尺寸适配方式" className="h-10 w-full bg-secondary">
        <TabsTrigger value="relative" disabled={disabled} className="h-full gap-1.5"><Ratio className="size-3.5" />按图片比例适配</TabsTrigger>
        <TabsTrigger value="original" disabled={disabled} className="h-full gap-1.5"><Maximize2 className="size-3.5" />保留模板原尺寸</TabsTrigger>
      </TabsList>
      <TabsContent value="relative" className="text-xs leading-5 text-muted-foreground">线条随图片宽高缩放，图片保持原样。</TabsContent>
      <TabsContent value="original" className="text-xs leading-5 text-muted-foreground">保留线条的原始尺寸与位置，超出图片的部分不裁。</TabsContent>
    </Tabs>
  </section>
}
