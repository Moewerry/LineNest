import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { registerImage, validateImage } from '@/lib/images'
import { useEditor } from '../model/store'
import { useShortcuts } from '../hooks/use-shortcuts'
import { EditorCanvas } from './EditorCanvas'
import { ObjectPanel } from './ObjectPanel'
import { ToolBar } from './ToolBar'
import { TopBar } from './TopBar'
import { TemplateDialog } from '@/features/templates/TemplateDialog'
import { ExportButton } from './ExportButton'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useImageDrop } from '@/hooks/use-image-drop'
import { ImageDropOverlay } from '@/components/ImageDropOverlay'
import { CanvasEmptyState } from './CanvasEmptyState'
import '../editor-theme.css'

export function Editor() {
  const [busy, setBusy] = useState(false), [pending, setPending] = useState<File | null>(null)
  const [panelOpen, setPanelOpen] = useState(true)
  const image = useEditor(s => s.present.doc.image)
  const input = useRef<HTMLInputElement>(null), loading = useRef(false)
  useShortcuts(!busy && !pending)
  const load = async (file: File) => {
    if (loading.current) return
    loading.current = true; setBusy(true)
    try {
      validateImage(file)
      const image = await registerImage(file, file.name)
      useEditor.getState().setImage(image)
      toast.success('图片已导入')
    } catch (error) { toast.error(error instanceof Error ? error.message : '导入失败') }
    finally { loading.current = false; setBusy(false) }
  }
  const requestImport = (file: File) => {
    if (loading.current || pending) return
    try { validateImage(file) } catch (error) { toast.error((error as Error).message); return }
    const { doc } = useEditor.getState().present
    if (doc.roots.length || doc.crop) setPending(file)
    else void load(file)
  }
  const { dragging, dropHandlers } = useImageDrop(requestImport, busy || !!pending)
  return <main className="editor-workspace relative isolate flex h-dvh min-w-[760px] flex-col overflow-hidden bg-background text-foreground" {...dropHandlers}>
    <div inert={!image} aria-hidden={!image ? true : undefined} className="flex min-h-0 flex-1 flex-col">
      <TopBar onImport={requestImport} busy={busy}><TemplateDialog disabled={busy} /><Button variant="ghost" size="icon" aria-label={panelOpen ? '收起对象面板' : '打开对象面板'} aria-pressed={panelOpen} title={panelOpen ? '收起对象面板' : '打开对象面板'} onClick={() => setPanelOpen(!panelOpen)}>{panelOpen ? <PanelRightClose /> : <PanelRightOpen />}</Button><ExportButton disabled={busy} /></TopBar>
      <div className="flex min-h-0 flex-1"><ToolBar /><EditorCanvas busy={busy} />{panelOpen && <ObjectPanel />}</div>
    </div>
    {!image && <CanvasEmptyState onPick={() => input.current?.click()} busy={busy} dragging={dragging} />}
    {image && dragging && <ImageDropOverlay />}
    <input ref={input} type="file" className="hidden" aria-label="导入图片" accept="image/png,image/jpeg,image/webp,image/avif" onChange={e => { const file = e.target.files?.[0]; if (file) requestImport(file); e.target.value = '' }} />
    <Dialog open={!!pending} onOpenChange={open => { if (!open) setPending(null) }}><DialogContent><DialogHeader><DialogTitle>替换当前图片？</DialogTitle><DialogDescription>当前线条和裁剪选区将清空。替换后可以撤销恢复。</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setPending(null)}>取消</Button><Button onClick={() => { const file = pending; setPending(null); if (file) void load(file) }}>替换图片</Button></DialogFooter></DialogContent></Dialog>
  </main>
}
