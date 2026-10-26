import { Crop, Grid2X2, Hand, MousePointer2, Slash } from 'lucide-react'
import type { Tool } from '../model/types'

const modes = {
  split: { label: '分割线模式', hint: '单击添加竖线 · 按住 W 单击添加横线', icon: Grid2X2 },
  select: { label: '选择模式', hint: '单击选择 · 拖动调整线条 · Shift 多选', icon: MousePointer2 },
  pan: { label: '拖动画布模式', hint: '按住左键拖动画布 · S 返回分割线', icon: Hand },
  line: { label: '自由画线模式', hint: '按住左键拖动画线 · V 选择微调', icon: Slash },
  crop: { label: '裁剪模式', hint: '按住左键框选裁剪范围', icon: Crop },
} satisfies Record<Tool, { label: string; hint: string; icon: typeof Hand }>

export function CanvasModeStatus({ tool, panSource, horizontal }: { tool: Tool; panSource: 'space' | 'middle' | null; horizontal: boolean }) {
  const mode = modes[tool], temporary = tool !== 'pan' && panSource !== null
  const Icon = temporary ? Hand : mode.icon
  const hint = temporary
    ? panSource === 'middle' ? `按住鼠标中键拖动 · 松开返回${mode.label}` : `按住左键拖动 · 松开空格返回${mode.label}`
    : tool === 'split' && horizontal ? '单击添加横线 · 松开 W 恢复竖线' : mode.hint

  return <div id="canvas-mode-status" role="status" aria-atomic="true" className="flex items-center gap-3 rounded-xl border bg-card/95 px-3 py-2 shadow-sm">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-4" /></span>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-foreground">{temporary ? '临时拖动画布' : mode.label}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{hint}{!temporary && tool !== 'pan' && <span className="ml-2">按住空格拖动画布</span>}</p>
    </div>
  </div>
}
