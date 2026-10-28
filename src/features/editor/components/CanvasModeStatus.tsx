import { ChevronDown, Hand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { Tool } from '../model/types'
import { ShortcutKeys } from './ShortcutKeys'
import { toolGuides, type ToolInstruction } from './tool-guide'

export function CanvasModeStatus({ tool, panSource, horizontal, erasing = false }: { tool: Tool; panSource: 'space' | 'middle' | null; horizontal: boolean; erasing?: boolean }) {
  const mode = toolGuides[tool], temporary = tool !== 'pan' && panSource !== null
  const Icon = temporary ? Hand : mode.icon
  const instructions: ToolInstruction[] = temporary
    ? [
      panSource === 'middle'
        ? { action: '按住鼠标中键', result: '拖动整张画布' }
        : { action: '按住', keys: ['空格'], gesture: '＋左键', result: '拖动整张画布' },
      panSource === 'middle'
        ? { action: '松开中键', result: `继续使用「${mode.label}」` }
        : { action: '松开', keys: ['空格'], result: `继续使用「${mode.label}」` },
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

  return <Collapsible data-tool-guide onKeyDown={event => event.stopPropagation()} className="pointer-events-auto w-[360px] max-w-full overflow-hidden rounded-xl border bg-card text-foreground">
    <div className="flex items-start gap-2.5 px-4 pb-2.5 pt-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-[18px]" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p id="canvas-mode-status" role="status" aria-atomic="true" className="text-base font-semibold leading-5">{temporary ? '临时移动画布' : tool === 'fill' && erasing ? '清除色块标记' : mode.label}</p>
          {!temporary && <ShortcutKeys keys={[mode.shortcut]} variant="highlight" />}
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{temporary ? '松开后继续使用当前工具。' : mode.description}</p>
      </div>
      <CollapsibleTrigger asChild><Button variant="ghost" size="icon-xs" aria-label="操作说明" title="展开或收起操作说明" className="text-muted-foreground [&[data-state=open]_svg]:rotate-180"><ChevronDown className="size-3 transition-transform" /></Button></CollapsibleTrigger>
    </div>
    <CollapsibleContent className="max-h-[40dvh] overflow-y-auto pb-3">
    <div className="mx-3 space-y-2.5 rounded-lg border border-dashed border-primary px-3 py-3 text-primary">
      {instructions.map(instruction => <div key={instruction.result} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-[11px] leading-relaxed">
        <span className="font-medium">{instruction.result}</span>
        <span className="flex flex-wrap items-center justify-end gap-1 text-foreground">
          <span>{instruction.action}</span>
          {instruction.keys && <ShortcutKeys keys={instruction.keys} variant="highlight" />}
          {instruction.gesture && <span>{instruction.gesture}</span>}
        </span>
      </div>)}
    </div>
    {!temporary && tool !== 'pan' ? <div className="flex items-start gap-1.5 px-4 pt-3 text-[11px] leading-relaxed text-muted-foreground">
        <Hand aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
        <span>按住 <ShortcutKeys keys={['空格']} variant="highlight" /> 临时移动画布，松开恢复当前工具。</span>
      </div>
    : null}
    </CollapsibleContent>
  </Collapsible>
}
