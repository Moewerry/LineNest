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
  return <footer className="shrink-0 border-t bg-card px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-8 sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-4">
    <div className="mx-auto max-w-7xl">
      <ol aria-label="批量裁剪操作流程" className="grid grid-cols-4 gap-1 sm:gap-3 md:gap-4">
        {steps.map(({ label, description, icon: Icon, action, disabled }, index) => {
          const active = currentStep === index + 1
          return <li key={index} aria-current={active ? 'step' : undefined}>
            <Button variant={active ? 'default' : 'ghost'} disabled={disabled} onClick={action} aria-label={`${index + 1}. ${label}，${description}`} title={label} className={cn(
              'h-full min-h-12 w-full justify-center gap-1 rounded-xl px-1 py-2 text-left whitespace-normal shadow-none sm:min-h-16 sm:justify-start sm:gap-3 sm:px-4 sm:py-3',
              !active && 'text-muted-foreground',
            )}>
              <span aria-hidden="true" className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs tabular-nums', active ? 'bg-white/15' : 'bg-secondary')}>{String(index + 1).padStart(2, '0')}</span>
              <span className="min-w-0"><span className="flex items-center gap-2 text-sm"><Icon aria-hidden="true" /><span className="hidden sm:inline">{label}</span></span><span className={cn('mt-1 hidden text-[11px] font-normal leading-4 sm:block', active ? 'text-primary-foreground/75' : 'text-muted-foreground')}>{description}</span></span>
            </Button>
          </li>
        })}
      </ol>
      <p role="status" aria-live="polite" className="sr-only">当前第 {currentStep} 步：{steps[currentStep - 1].label}{running ? `，${status}` : ''}</p>
    </div>
  </footer>
}
