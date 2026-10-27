import { ImagePlus } from 'lucide-react'
import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEditor } from '@/features/editor/model/store'
import { registerImage, validateImage } from '@/lib/images'
import { useImageDrop } from '@/hooks/use-image-drop'
import { ImageDropOverlay } from '@/components/ImageDropOverlay'
import { LoadingOverlay } from '@/components/LoadingOverlay'

const ImportContext = createContext<{ pickImage: () => void; busy: boolean } | null>(null)

export function useHomeImageImport() {
  const context = useContext(ImportContext)
  if (!context) throw new Error('图片导入入口必须位于 HomeImageImport 内')
  return context
}

export function HomeImageImport({ children }: { children: ReactNode }) {
  const input = useRef<HTMLInputElement>(null)
  const loading = useRef(false)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<File | null>(null)
  const navigate = useNavigate()

  const load = async (file: File) => {
    if (loading.current) return
    loading.current = true
    setBusy(true)
    try {
      validateImage(file)
      const image = await registerImage(file, file.name)
      useEditor.getState().setImage(image)
      navigate('/editor', { state: { importedImageId: image.id } })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '导入失败')
      loading.current = false
      setBusy(false)
    }
  }

  const requestImport = (file: File) => {
    if (loading.current || pending) return
    try { validateImage(file) } catch (error) {
      toast.error(error instanceof Error ? error.message : '无法导入图片')
      return
    }
    const { doc } = useEditor.getState().present
    if (doc.roots.length || doc.crop || doc.marks?.length) setPending(file)
    else void load(file)
  }

  const { dragging, dropHandlers } = useImageDrop(requestImport, busy || !!pending)

  return <ImportContext.Provider value={{ busy, pickImage: () => { if (!loading.current && !pending) input.current?.click() } }}>
    <div className="home-page flex min-h-dvh flex-col overflow-clip bg-background" {...dropHandlers}>
      {children}
      {dragging && <ImageDropOverlay />}
    </div>
    <LoadingOverlay open={busy} title="正在导入图片" description="正在读取图片并打开工作台，请稍候。" />
    <input ref={input} type="file" className="hidden" aria-label="选择分图图片" accept="image/png,image/jpeg,image/webp,image/avif" disabled={busy} onChange={event => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (file) requestImport(file)
    }} />
    <Dialog open={!!pending} onOpenChange={open => { if (!open) setPending(null) }}><DialogContent><DialogHeader icon={<ImagePlus />}><DialogTitle>替换当前图片？</DialogTitle><DialogDescription>当前线条、裁剪选区和区域标记将清空。替换后可以撤销恢复。</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setPending(null)}>取消</Button><Button onClick={() => {
      const file = pending
      setPending(null)
      if (file) void load(file)
    }}>替换图片</Button></DialogFooter></DialogContent></Dialog>
  </ImportContext.Provider>
}
