import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { registerImage, validateImage } from '@/lib/images'
import { useEditor } from '../model/store'
import { waitForWorkspaceSave } from '../model/workspace-session'
import { useShortcuts } from '../hooks/use-shortcuts'
import { useMissingImageHint } from '../hooks/use-missing-image-hint'
import { EditorCanvas } from './EditorCanvas'
import { EditorSidebar } from './EditorSidebar'
import { CanvasWorkspace } from './CanvasWorkspace'
import { ToolBar } from './ToolBar'
import { TopBar } from './TopBar'
import { ExportButton } from './ExportButton'
import { ImagePlus } from 'lucide-react'
import { useImageDrop } from '@/hooks/use-image-drop'
import { ImageDropOverlay } from '@/components/ImageDropOverlay'
import { EditorImportOverlay } from './EditorImportOverlay'
import { EditorImportDialog } from './EditorImportDialog'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import '../editor-theme.css'

export function Editor() {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const hasImage = useEditor(state => !!state.present.doc.image)
  const [importGuide, setImportGuide] = useState<'overlay' | 'dialog' | null>(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const refreshing = navigationType === 'POP' && navigation?.type === 'reload'
    if (hasImage || refreshing) return null
    return location.state?.showImageImport === true ? 'overlay' : 'dialog'
  })
  const importOpen = !hasImage && importGuide !== null
  const overlayOpen = importOpen && importGuide === 'overlay'
  useEffect(() => {
    if (location.state?.showImageImport !== true) return
    const { showImageImport: _, ...state } = location.state
    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state })
  }, [location, navigate])
  const [importing, setImporting] = useState(false), [pending, setPending] = useState<File | null>(null)
  const importedImageId = location.state?.importedImageId
  const entering = useEditor(state => typeof importedImageId === 'string' && importedImageId === state.present.doc.image?.id)
  useEffect(() => {
    if (typeof location.state?.importedImageId !== 'string' || entering) return
    // Navigation state can refer to an image that has since been cleared or replaced.
    const { importedImageId: _, ...state } = location.state
    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state })
  }, [entering, location, navigate])
  const busy = importing || entering
  const onImageReady = useCallback((imageId: string) => {
    if (location.state?.importedImageId !== imageId) return
    const { importedImageId: _, ...state } = location.state
    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state })
    toast.success('图片已导入', { id: `image-import-${imageId}` })
  }, [location, navigate])
  const input = useRef<HTMLInputElement>(null), loading = useRef(false)
  const missingImageHint = useMissingImageHint(!busy && !pending && !importOpen)
  useShortcuts(!busy && !pending && !importOpen, missingImageHint.notify)
  const load = async (file: File) => {
    if (loading.current) return
    loading.current = true; setImporting(true)
    try {
      validateImage(file)
      const image = await registerImage(file, file.name)
      useEditor.getState().setImage(image)
      await waitForWorkspaceSave()
      setImportGuide(null)
      toast.success('图片已导入')
    } catch (error) { toast.error(error instanceof Error ? error.message : '导入失败') }
    finally { loading.current = false; setImporting(false) }
  }
  const requestImport = (file: File) => {
    if (loading.current || pending) return
    try { validateImage(file) } catch (error) { toast.error((error as Error).message); return }
    const { doc } = useEditor.getState().present
    if (doc.roots.length || doc.crop || doc.marks?.length) setPending(file)
    else void load(file)
  }
  const { dragging, dropHandlers } = useImageDrop(requestImport, busy || !!pending)
  const removeImage = () => {
    if (loading.current || pending) return
    useEditor.getState().removeImage()
  }
  return <main className="editor-workspace relative isolate flex h-dvh min-w-[760px] flex-col overflow-hidden bg-background text-foreground [&_button:disabled]:pointer-events-auto" {...dropHandlers} onPointerDownCapture={missingImageHint.onPointerDownCapture}>
    <div inert={overlayOpen} aria-hidden={overlayOpen ? true : undefined} className="flex min-h-0 flex-1 flex-col">
      <TopBar onImport={requestImport} busy={busy}><ExportButton disabled={busy} /></TopBar>
      <div className="flex min-h-0 flex-1"><ToolBar busy={busy} /><CanvasWorkspace><EditorCanvas busy={busy} onReplaceImage={() => input.current?.click()} onDeleteImage={removeImage} onImageReady={entering ? onImageReady : undefined} /></CanvasWorkspace><EditorSidebar disabled={busy} /></div>
    </div>
    {overlayOpen && <EditorImportOverlay onPick={() => input.current?.click()} busy={busy} dragging={dragging} />}
    {dragging && !overlayOpen && <ImageDropOverlay />}
    <LoadingOverlay open={entering} />
    <input ref={input} type="file" className="hidden" aria-label="导入图片" accept="image/png,image/jpeg,image/webp,image/avif" onChange={e => { const file = e.target.files?.[0]; if (file) requestImport(file); e.target.value = '' }} />
    <EditorImportDialog open={importOpen && importGuide === 'dialog'} onOpenChange={open => { if (!open) setImportGuide(null) }} onPick={() => { setImportGuide(null); input.current?.click() }} />
    <Dialog open={!!pending} onOpenChange={open => { if (!open) setPending(null) }}><DialogContent><DialogHeader icon={<ImagePlus />}><DialogTitle>替换当前图片？</DialogTitle><DialogDescription>当前线条、裁剪选区和区域标记将清空。替换后可以撤销恢复。</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setPending(null)}>取消</Button><Button onClick={() => { const file = pending; setPending(null); if (file) void load(file) }}>替换图片</Button></DialogFooter></DialogContent></Dialog>
  </main>
}
