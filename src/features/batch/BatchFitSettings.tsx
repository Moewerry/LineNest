import { Maximize2, Ratio } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { BatchFit } from './types'

export function BatchFitSettings({ fit, disabled, onFit }: { fit: BatchFit; disabled: boolean; onFit: (fit: BatchFit) => void }) {
  return <section aria-label="尺寸适配" className="rounded-xl bg-secondary/50 p-5">
    <h3 className="mb-3 text-sm font-medium">尺寸适配</h3>
    <Tabs value={fit} onValueChange={value => { if (value === 'relative' || value === 'original') onFit(value) }} className="gap-3">
      <TabsList aria-label="尺寸适配方式" className="h-auto w-full flex-col gap-2 bg-transparent p-0 sm:flex-row">
        <TabsTrigger value="relative" disabled={disabled} className="min-h-11 w-full gap-2 border bg-card px-4 text-xs data-[state=active]:border-primary/40 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-none"><Ratio className="size-4" />按图片比例适配</TabsTrigger>
        <TabsTrigger value="original" disabled={disabled} className="min-h-11 w-full gap-2 border bg-card px-4 text-xs data-[state=active]:border-primary/40 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-none"><Maximize2 className="size-4" />保留模板原尺寸</TabsTrigger>
      </TabsList>
      <TabsContent value="relative" className="text-xs leading-5 text-muted-foreground">线条随图片缩放</TabsContent>
      <TabsContent value="original" className="text-xs leading-5 text-muted-foreground">线条尺寸与位置不变</TabsContent>
    </Tabs>
  </section>
}
