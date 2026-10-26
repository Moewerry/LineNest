import { useState } from 'react'
import { Copy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// An explicitly labelled SVG demonstration, not a screenshot of a running editor.
export function EditorPreview() {
  const [copied, setCopied] = useState(false)
  const lines = <><path d="M0 0H210 M0 90H210 M0 180H210 M0 0V180 M105 0V180 M210 0V180" fill="none" stroke="#237a60" strokeWidth="1.5" /><rect x="-8" y="-8" width="226" height="196" rx="3" fill="none" stroke="#237a60" strokeDasharray="5 4" /></>
  return <section aria-label="线条编组操作示意" className="overflow-hidden rounded-2xl border bg-white">
    <div className="flex items-center justify-between border-b px-5 py-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-ring" />线条布局示意</div><Button variant="ghost" size="sm" onClick={() => setCopied(!copied)}>{copied ? <RotateCcw /> : <Copy />}{copied ? '重置示意' : '试试复制'}</Button></div>
    <div className="canvas-surface px-3 py-5 md:px-10 md:py-7">
      <svg viewBox="0 0 960 420" role="img" aria-label={copied ? '两组保持相对位置的分割线' : '图片上选中的一组分割线'} className="mx-auto block w-full max-w-5xl">
        <defs><pattern id="demo-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#d6d9d2" strokeWidth="0.5" /></pattern><clipPath id="demo-image-clip"><rect x="70" y="24" width="820" height="372" rx="2" /></clipPath></defs>
        <g clipPath="url(#demo-image-clip)">
          <rect x="70" y="24" width="820" height="372" fill="#e5e7df" />
          <rect x="70" y="24" width="820" height="372" fill="url(#demo-grid)" />
          <path d="M70 328L258 122L400 264L572 66L890 396H70Z" fill="#c4cbbf" />
          <path d="M252 396L568 152L890 396Z" fill="#adb7a8" />
          <circle cx="758" cy="105" r="38" fill="#fafaf7" />
          <path d="M70 360C294 302 406 378 620 325S814 319 890 302V396H70Z" fill="#8f9c89" />
          <g transform="translate(160 114)">{lines}</g>
          {copied && <g transform="translate(566 114)">{lines}</g>}
        </g>
        <g transform="translate(152 77)"><rect width="70" height="23" rx="5" fill="#27272a" /><text x="35" y="15" textAnchor="middle" fontSize="10" fill="white" fontFamily="sans-serif">组群 01</text></g>
        {copied && <g transform="translate(558 77)"><rect width="86" height="23" rx="5" fill="#27272a" /><text x="43" y="15" textAnchor="middle" fontSize="10" fill="white" fontFamily="sans-serif">组群 01 副本</text></g>}
      </svg>
    </div>
    <div className="flex items-center justify-between gap-4 border-t px-5 py-3 text-[11px] text-muted-foreground"><span>选中一组线，复制到需要的位置。</span><span className="hidden sm:block">{copied ? '相对位置保持不变' : 'Ctrl + G 编组 · Ctrl + D 复制'}</span></div>
  </section>
}
