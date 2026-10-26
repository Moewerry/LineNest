import { Copy, ImagePlus, Scissors } from 'lucide-react'
import { HomeAnimatedText } from './HomeAnimatedText'

const steps = [
  { number: '01', icon: ImagePlus, title: '导入一张图片', description: '选择图片，或拖入工作台，即可开始。' },
  { number: '02', icon: Copy, title: '编组复制，减少重复', description: '画好一组分割线，整体复制到更多位置。' },
  { number: '03', icon: Scissors, title: '一次导出所需素材', description: '预览分割结果，保存你需要的素材。' },
]

export function HomeWorkflow() {
  return <section aria-label="分图操作流程" className="home-workflow relative mb-3 shrink-0 py-4 lg:py-5">
    <span aria-hidden="true" className="home-workflow-divider absolute inset-x-0 top-0 h-px origin-left bg-primary" />
    <ol className="grid gap-4 sm:grid-cols-3 sm:gap-8">
      {steps.map(({ number, icon: Icon, title, description }, index) => <li key={number} className="home-workflow-step flex items-start gap-4">
        <span className="pt-1 font-mono text-xs text-primary"><HomeAnimatedText delay={180 + index * 100} stagger={45}>{number}</HomeAnimatedText></span>
        <div><h2 className="flex items-center gap-2 text-sm font-semibold"><Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.6} /><HomeAnimatedText delay={400 + index * 100}>{title}</HomeAnimatedText></h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground"><HomeAnimatedText delay={540 + index * 100} stagger={20}>{description}</HomeAnimatedText></p></div>
      </li>)}
    </ol>
  </section>
}
