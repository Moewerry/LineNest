import { Copy, ImagePlus, Scissors } from 'lucide-react'

const steps = [
  { number: '01', icon: ImagePlus, title: '导入一张图片', description: '选择图片，或拖入工具台，即可开始。' },
  { number: '02', icon: Copy, title: '编组复制，减少重复', description: '画好一组分割线，整体复制到更多位置。' },
  { number: '03', icon: Scissors, title: '一次导出所需素材', description: '预览分割结果，保存你需要的素材。' },
]

export function HomeWorkflow() {
  return <section aria-label="分图操作流程" className="mt-auto shrink-0 border-t pt-8">
    <ol className="grid gap-8 sm:grid-cols-3 sm:gap-10">
      {steps.map(({ number, icon: Icon, title, description }) => <li key={number} className="flex items-start gap-4">
        <span className="shrink-0 font-mono text-xs leading-5 text-muted-foreground/60">{number}</span>
        <div><h2 className="flex items-center gap-2 text-sm font-medium"><Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />{title}</h2>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">{description}</p></div>
      </li>)}
    </ol>
  </section>
}
