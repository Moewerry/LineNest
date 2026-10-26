import { Hand } from 'lucide-react'
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
      ]
      : tool === 'split' && horizontal
        ? [
          { action: '左键单击', result: '添加一条横线' },
          { action: '松开', keys: ['W'], result: '恢复添加竖线' },
        ]
        : mode.instructions

  return <div id="canvas-mode-status" role="status" aria-atomic="true" className="w-[360px] max-w-full overflow-hidden rounded-xl border bg-card text-foreground shadow-sm">
    <div className="flex items-start gap-2.5 px-4 pb-2.5 pt-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-[18px]" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold leading-5">{temporary ? '临时移动画布' : tool === 'fill' && erasing ? '清除色块标记' : mode.label}</p>
          {!temporary && <span className="text-muted-foreground"><ShortcutKeys keys={[mode.shortcut]} /></span>}
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{temporary ? '松开后继续使用当前工具。' : mode.description}</p>
      </div>
    </div>
    <div className="mx-3 space-y-2.5 rounded-lg bg-primary/10 px-3 py-3">
      {instructions.map(instruction => <div key={instruction.result} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-[11px] leading-relaxed">
        <span className="font-medium">{instruction.result}</span>
        <span className="flex flex-wrap items-center justify-end gap-1 text-muted-foreground">
          <span>{instruction.action}</span>
          {instruction.keys && <ShortcutKeys keys={instruction.keys} />}
          {instruction.gesture && <span>{instruction.gesture}</span>}
        </span>
      </div>)}
    </div>
    {!temporary && tool !== 'pan' ? <div className="flex flex-wrap items-center gap-1.5 px-4 py-3 text-[11px] text-muted-foreground">
        <Hand aria-hidden="true" className="size-3" />
        <span>移动画布：按住空格+左键拖动</span>
      </div>
    : <div className="h-3" />}
  </div>
}
