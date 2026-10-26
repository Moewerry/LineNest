import { Download, ImagePlus, LayoutTemplate, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function BatchWorkflow({ busy, running, importing, count, selected, total, status, currentStep, onAdd, onTemplates, onCrop, onCancel, onDownload }: {
  busy: boolean; running: boolean; importing: boolean; count: number; selected: number; total?: number; status: string
  currentStep: 1 | 2 | 3 | 4
  onAdd: () => void; onTemplates: () => void; onCrop: () => void; onCancel: () => void; onDownload: () => void
}) {
  const steps = [
    { label: importing ? '正在读取…' : '添加多张图片', description: `${count} / 100 张图片`, icon: ImagePlus, action: onAdd, disabled: busy || count >= 100 },
    { label: '选择模板', description: selected ? `已选 ${selected} 个模板` : '选择或新建线条模板', icon: LayoutTemplate, action: onTemplates, disabled: busy },
    { label: running ? '取消裁剪' : total ? '重新裁剪' : '裁剪', description: running ? status : '按所选模板批量分图', icon: Scissors, action: running ? onCancel : onCrop, disabled: !running && (busy || !count || !selected) },
    { label: '下载', description: total ? `${status} · ZIP` : '裁剪完成后下载 ZIP', icon: Download, action: onDownload, disabled: busy || !total },
  ]
  return <footer className="shrink-0 bg-background px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
    <div className="mx-auto max-w-6xl border-t border-primary pt-3">
      <ol aria-label="批量裁剪操作流程" className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4 md:gap-6">
        {steps.map(({ label, description, icon: Icon, action, disabled }, index) => {
          const active = currentStep === index + 1
          return <li key={index} aria-current={active ? 'step' : undefined}>
            <Button variant="ghost" disabled={disabled} onClick={action} className={cn(
              'h-full min-h-20 w-full items-start justify-start gap-3 rounded-lg border bg-transparent px-3 py-3 text-left whitespace-normal transition-colors hover:bg-transparent active:bg-transparent disabled:opacity-100 dark:hover:bg-transparent',
              active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground/60 hover:text-muted-foreground',
            )}>
              <span aria-hidden="true" className={cn('shrink-0 font-mono text-lg leading-5 tabular-nums', active ? 'text-primary' : 'text-muted-foreground/45')}>{String(index + 1).padStart(2, '0')}</span>
              <span className="min-w-0"><span className="flex items-center gap-2"><Icon aria-hidden="true" />{label}</span><span className={cn('mt-1 block text-xs font-normal leading-5', active ? 'text-muted-foreground' : 'text-muted-foreground/50')}>{description}</span></span>
            </Button>
          </li>
        })}
      </ol>
      <p role="status" aria-live="polite" className="sr-only">当前第 {currentStep} 步：{steps[currentStep - 1].label}{running ? `，${status}` : ''}</p>
    </div>
  </footer>
}
