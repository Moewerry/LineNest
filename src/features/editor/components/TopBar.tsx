import { useRef, type ReactNode } from 'react'
import { ImagePlus, Layers3, Redo2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditor } from '../model/store'
export function TopBar({ onImport, busy, children }: { onImport: (file: File) => void; busy: boolean; children?: ReactNode }) {
  const input = useRef<HTMLInputElement>(null)
  const image = useEditor(s => s.present.doc.image), past = useEditor(s => s.past.length), future = useEditor(s => s.future.length)
  return <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-5">
    <div className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight"><span className="rounded-lg bg-primary p-2"><Layers3 className="size-5" /></span><span className="text-lg">LineNest</span></div>
    <span className="max-w-48 truncate border-l pl-4 text-xs text-muted-foreground" title={image?.name}>{image?.name ?? '未命名'}</span>
    <div className="ml-auto flex items-center gap-1">
      <Button variant="ghost" size="icon" aria-label="撤销 Ctrl+Z" title="撤销 Ctrl+Z" disabled={!past || busy} onClick={() => useEditor.getState().undo()}><Undo2 /></Button>
      <Button variant="ghost" size="icon" aria-label="重做 Ctrl+Shift+Z" title="重做 Ctrl+Shift+Z" disabled={!future || busy} onClick={() => useEditor.getState().redo()}><Redo2 /></Button>
      <span className="mx-2 h-5 border-l" />
      <Button variant="outline" disabled={busy} onClick={() => input.current?.click()}><ImagePlus />{busy ? '正在读取' : '导入图片'}</Button>
      {children}
    </div>
    <input ref={input} className="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/avif" aria-label="选择图片" onChange={e => { const file = e.target.files?.[0]; if (file) onImport(file); e.target.value = '' }} />
  </header>
}
