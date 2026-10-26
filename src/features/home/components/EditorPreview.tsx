import { useState } from 'react'
import { Copy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { canvasColors } from '@/lib/canvas-colors'

// Original raster artwork with a labelled, interactive grouping overlay.
export function EditorPreview() {
  const [copied, setCopied] = useState(false)
  const linePath = 'M155 7V498 M7 170H303 M7 334H303'
  const lines = <>
    <path d={linePath} fill="none" stroke="white" strokeWidth="3.5" vectorEffect="non-scaling-stroke" />
    <path d={linePath} fill="none" stroke={canvasColors.selection} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    <rect x="7" y="7" width="296" height="491" rx="3" fill="none" stroke={canvasColors.selection} strokeWidth="1" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
  </>
  return <section aria-label="贴纸线条编组操作示意" className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border-2 border-foreground bg-white">
    <div className="flex shrink-0 items-center justify-between gap-3 bg-foreground px-4 py-3 text-white"><div className="flex items-center gap-2 text-xs font-medium"><span className="size-2 rounded-full bg-highlight" />线条布局示意</div><Button variant="secondary" size="sm" className="bg-highlight text-highlight-foreground hover:bg-highlight/90" onClick={() => setCopied(!copied)}>{copied ? <RotateCcw /> : <Copy />}{copied ? '重置示意' : '试试复制'}</Button></div>
    <div className="canvas-surface flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 md:p-4">
      <svg viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid meet" role="img" aria-label={copied ? '原创十格小猫贴纸图，相邻两格内有相同的分割线组群' : '原创十格小猫贴纸图，第一格内有一组分割线'} className="block h-full min-h-0 w-full">
        <image href="/images/bakery-cat-sticker-sheet.png" width="1536" height="1024" />
        <g>{lines}</g>
        {copied && <g transform="translate(307 0)">{lines}</g>}
      </svg>
    </div>
    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-foreground/15 px-4 py-3 text-[11px]"><span>{copied ? '已复制到下一格，相对位置保持不变。' : '选中一组线，试试整体复制。'}</span><span className="shrink-0 rounded bg-accent px-2 py-1 font-medium text-primary">{copied ? '2 个组群' : '1 个组群'}</span></div>
  </section>
}
