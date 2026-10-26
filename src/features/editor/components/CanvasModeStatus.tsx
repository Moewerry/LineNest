import { Hand } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import type { Tool } from '../model/types'
import { ShortcutKeys } from './ShortcutKeys'
import { toolGuides, type ToolInstruction } from './tool-guide'

export function CanvasModeStatus({ tool, panSource, horizontal, erasing = false }: { tool: Tool; panSource: 'space' | 'middle' | null; horizontal: boolean; erasing?: boolean }) {
  const mode = toolGuides[tool], temporary = tool !== 'pan' && panSource !== null
  const Icon = temporary ? Hand : mode.icon
  const instructions: ToolInstruction[] = temporary
    ? [
      { action: panSource === 'middle' ? '按住鼠标中键' : '按住空格和左键', result: '拖动整张画布' },
      { action: panSource === 'middle' ? '松开中键' : '松开空格', result: `继续使用「${mode.label}」` },
    ]
    : tool === 'fill' && erasing
      ? [
        { action: '左键单击色块', result: '清除这一块的标记' },
        { action: '继续标记', result: '在下方切换到「标记区域」' },
      ]
      : tool === 'split' && horizontal
        ? [
          { action: '左键单击', result: '添加一条横线' },
          { action: '松开', keys: ['W'], result: '恢复添加竖线' },
        ]
        : mode.instructions

  return <div id="canvas-mode-status" role="status" aria-atomic="true" className="w-80 max-w-full overflow-hidden rounded-xl border bg-card text-foreground shadow-sm">
    <div className="flex items-start gap-3 px-4 pb-3 pt-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-[18px]" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold">{temporary ? '临时移动画布' : tool === 'fill' && erasing ? '清除裁切标记' : mode.label}</p>
          {!temporary && <span className="text-muted-foreground"><ShortcutKeys keys={[mode.shortcut]} /></span>}
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{temporary ? '松开后会自动回到刚才的工具。' : mode.description}</p>
      </div>
    </div>
    <div className="mx-3 mb-3 space-y-2 rounded-lg bg-muted/60 p-3">
      {instructions.map(instruction => <div key={instruction.action} className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] leading-relaxed">
        <span className="font-medium">{instruction.action}</span>
        {instruction.keys && <ShortcutKeys keys={instruction.keys} />}
        <span className="text-muted-foreground">{instruction.result}</span>
      </div>)}
    </div>
    {!temporary && tool !== 'pan' && <>
      <Separator />
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 text-[10px] text-muted-foreground">
        <Hand aria-hidden="true" className="size-3" />
        <span>移画布：按住</span><ShortcutKeys keys={['空格']} /><span>+ 左键拖动</span>
      </div>
    </>}
  </div>
}
