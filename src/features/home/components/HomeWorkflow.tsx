import { Copy, ImagePlus, Scissors } from 'lucide-react'

const steps = [
  { number: '01', icon: ImagePlus, title: '导入一张图片', description: '选择图片，或拖入工作台，即可开始。' },
  { number: '02', icon: Copy, title: '编组复制，减少重复', description: '画好一组分割线，整体复制到更多位置。' },
  { number: '03', icon: Scissors, title: '一次导出所需素材', description: '预览分割结果，保存你需要的素材。' },
]

export function HomeWorkflow() {
  return <section aria-label="分图操作流程" className="mb-8 grid gap-7 border-t border-foreground/20 py-8 sm:grid-cols-3 sm:gap-8 lg:py-10">
    {steps.map(({ number, icon: Icon, title, description }) => <div key={number} className="flex items-start gap-4">
      <span className="pt-1 font-mono text-xs text-primary">{number}</span>
      <div><h2 className="flex items-center gap-2 text-sm font-semibold"><Icon aria-hidden="true" className="size-4" strokeWidth={1.6} />{title}</h2>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">{description}</p></div>
    </div>)}
  </section>
}
