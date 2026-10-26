import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { discardImageAsset, registerImage, rotateImageClockwise, validateImage } from '@/lib/images'
import type { ImageInfo } from '../model/types'
import { useEditor } from '../model/store'
import { useShortcuts } from '../hooks/use-shortcuts'
import { EditorCanvas } from './EditorCanvas'
import { ObjectPanel } from './ObjectPanel'
import { ToolBar } from './ToolBar'
import { TopBar } from './TopBar'
import { HistoryToolBar } from './HistoryToolBar'
import { TemplateDialog } from '@/features/templates/TemplateDialog'
import { ExportButton } from './ExportButton'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useImageDrop } from '@/hooks/use-image-drop'
import { ImageDropOverlay } from '@/components/ImageDropOverlay'
import { CanvasEmptyState } from './CanvasEmptyState'
import '../editor-theme.css'

export function Editor() {
  const [operation, setOperation] = useState<'import' | 'rotate' | null>(null), [pending, setPending] = useState<File | null>(null)
  const busy = operation !== null
  const [panelOpen, setPanelOpen] = useState(true)
  const image = useEditor(s => s.present.doc.image)
  const input = useRef<HTMLInputElement>(null), loading = useRef(false)
  useShortcuts(!busy && !pending)
  const load = async (file: File) => {
    if (loading.current) return
    loading.current = true; setOperation('import')
    try {
      validateImage(file)
      const image = await registerImage(file, file.name)
      useEditor.getState().setImage(image)
      toast.success('图片已导入')
    } catch (error) { toast.error(error instanceof Error ? error.message : '导入失败') }
    finally { loading.current = false; setOperation(null) }
  }
  const rotateImage = async () => {
    const source = useEditor.getState().present, currentImage = source.doc.image
    if (loading.current || pending || !currentImage) return
    loading.current = true; setOperation('rotate')
    let rotated: ImageInfo | null = null
    try {
      rotated = await rotateImageClockwise(currentImage)
      const state = useEditor.getState()
      if (state.present !== source) throw new Error('画布已发生变化，请重新旋转图片')
      if (rotated.width !== currentImage.height || rotated.height !== currentImage.width) throw new Error('图片旋转失败，请重试')
      state.rotateImage(rotated)
    } catch (error) {
      if (rotated && useEditor.getState().present.doc.image?.id !== rotated.id) discardImageAsset(rotated.id)
      toast.error(error instanceof Error ? error.message : '旋转失败')
    } finally { loading.current = false; setOperation(null) }
  }
  const requestImport = (file: File) => {
    if (loading.current || pending) return
    try { validateImage(file) } catch (error) { toast.error((error as Error).message); return }
    const { doc } = useEditor.getState().present
    if (doc.roots.length || doc.crop || doc.marks?.length) setPending(file)
    else void load(file)
  }
  const { dragging, dropHandlers } = useImageDrop(requestImport, busy || !!pending)
  return <main className="editor-workspace relative isolate flex h-dvh min-w-[760px] flex-col overflow-hidden bg-background text-foreground" {...dropHandlers}>
    <div inert={!image} aria-hidden={!image ? true : undefined} className="flex min-h-0 flex-1 flex-col">
      <TopBar onImport={requestImport} busy={busy} busyLabel={operation === 'rotate' ? '正在旋转' : '正在读取'}><TemplateDialog disabled={busy} /><Button variant="ghost" size="icon" aria-label={panelOpen ? '收起对象面板' : '打开对象面板'} aria-pressed={panelOpen} title={panelOpen ? '收起对象面板' : '打开对象面板'} onClick={() => setPanelOpen(!panelOpen)}>{panelOpen ? <PanelRightClose /> : <PanelRightOpen />}</Button><ExportButton disabled={busy} /></TopBar>
      <div className="flex min-h-0 flex-1"><ToolBar busy={busy} /><div className="flex min-h-0 min-w-0 flex-1 flex-col"><EditorCanvas busy={busy} rotating={operation === 'rotate'} onRotateImage={() => void rotateImage()} /><HistoryToolBar busy={busy} /></div>{panelOpen && <ObjectPanel />}</div>
    </div>
    {!image && <CanvasEmptyState onPick={() => input.current?.click()} busy={busy} dragging={dragging} />}
    {image && dragging && <ImageDropOverlay />}
    <input ref={input} type="file" className="hidden" aria-label="导入图片" accept="image/png,image/jpeg,image/webp,image/avif" onChange={e => { const file = e.target.files?.[0]; if (file) requestImport(file); e.target.value = '' }} />
    <Dialog open={!!pending} onOpenChange={open => { if (!open) setPending(null) }}><DialogContent><DialogHeader><DialogTitle>替换当前图片？</DialogTitle><DialogDescription>当前线条、裁剪选区和区域标记将清空。替换后可以撤销恢复。</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setPending(null)}>取消</Button><Button onClick={() => { const file = pending; setPending(null); if (file) void load(file) }}>替换图片</Button></DialogFooter></DialogContent></Dialog>
  </main>
}
