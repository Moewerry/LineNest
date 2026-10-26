import { useEffect, useRef, useState } from 'react'
import { Download, FolderOpen, Pencil, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { deleteTemplate, listTemplates, readTemplate, renameTemplate, saveTemplate, type TemplateRecord } from '@/lib/db'
import { getImageAsset } from '@/lib/images'
import type { ImageInfo } from '@/features/editor/model/types'
import { useEditor } from '@/features/editor/model/store'
import { exportTemplate, importTemplate, type PreparedTemplate } from './portable'
import { TemplateThumbnail } from './TemplateThumbnail'
import { applyTemplate, sameSize } from './apply'

const message = (error: unknown) => error instanceof Error ? error.message : '操作失败，请检查浏览器存储权限或可用空间'
type Confirmation = { type: 'load'; template: PreparedTemplate; currentImage: ImageInfo | null } | { type: 'delete'; id: string }

export function TemplateDialog({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<TemplateRecord[]>([]), [name, setName] = useState('')
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null), [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null), operation = useRef(false)
  const image = useEditor(s => s.present.doc.image)
  const refresh = async () => setRows(await listTemplates())
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    listTemplates().then(list => { if (!cancelled) setRows(list) }).catch(error => toast.error(message(error))).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [open])
  const run = async (action: () => Promise<void>) => {
    if (operation.current) return
    operation.current = true; setBusy(true)
    try { await action() } catch (error) { toast.error(message(error)) }
    finally { operation.current = false; setBusy(false) }
  }
  const prepareLoad = (template: PreparedTemplate, applyToCurrent = false) => {
    const currentImage = applyToCurrent ? useEditor.getState().present.doc.image : null
    if (applyToCurrent && !currentImage) throw new Error('请先导入新图片')
    setConfirmation({ type: 'load', template, currentImage })
  }
  const confirm = () => void run(async () => {
    if (!confirmation) return
    if (confirmation.type === 'delete') {
      await deleteTemplate(confirmation.id); await refresh(); setConfirmation(null); toast.success('已删除模板'); return
    }
    await applyTemplate(confirmation.template, confirmation.currentImage)
    setConfirmation(null); setOpen(false); toast.success(confirmation.currentImage ? '布局已套用' : '模板已加载')
  })
  return <>
    <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value) }}>
      <DialogTrigger asChild><Button variant="ghost" disabled={disabled}><FolderOpen />模板</Button></DialogTrigger>
      <DialogContent className="sm:max-w-2xl" onInteractOutside={e => { if (busy) e.preventDefault() }} onEscapeKeyDown={e => { if (busy) e.preventDefault() }}>
        <DialogHeader><DialogTitle>模板</DialogTitle><DialogDescription>保存在当前浏览器，可导出文件备份。</DialogDescription></DialogHeader>
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); void run(async () => { await saveTemplate(name, structuredClone(useEditor.getState().present.doc)); await refresh(); setName(''); toast.success('已保存') }) }}>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="模板名称" aria-label="模板名称" maxLength={80} disabled={busy || !image} />
          <Button type="submit" disabled={busy || !image || !name.trim()}>保存当前布局</Button>
        </form>
        <div className="flex items-center justify-between border-b pb-3"><span className="text-xs text-muted-foreground">{rows.length} 个模板</span><div className="flex gap-1">
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => fileInput.current?.click()}><Upload />导入文件</Button>
          <Button variant="ghost" size="sm" disabled={busy || !image} onClick={() => void run(async () => {
            const doc = structuredClone(useEditor.getState().present.doc), asset = getImageAsset(doc.image?.id)
            if (!asset) throw new Error('请先导入图片')
            await exportTemplate(name.trim() || doc.image!.name.replace(/\.[^.]+$/, ''), doc, asset.blob)
          })}><Download />备份当前布局</Button>
        </div></div>
        <ScrollArea className="h-[min(46vh,400px)] pr-3">
          {loading ? <p className="py-10 text-center text-xs text-muted-foreground">正在读取模板</p> : !rows.length ? <p className="py-10 text-center text-xs text-muted-foreground">暂无模板</p> : rows.map(row => <div key={row.id} className="flex items-center gap-3 border-b py-3 last:border-0">
            <TemplateThumbnail blob={row.thumbnail} />
            <div className="min-w-0 flex-1">{renaming?.id === row.id ? <div className="flex gap-1"><Input value={renaming.name} maxLength={80} className="h-8" aria-label="新模板名称" onChange={e => setRenaming({ ...renaming, name: e.target.value })} /><Button size="sm" disabled={busy || !renaming.name.trim()} onClick={() => void run(async () => { await renameTemplate(row.id, renaming.name); setRenaming(null); await refresh() })}>保存</Button><Button variant="ghost" size="sm" onClick={() => setRenaming(null)}>取消</Button></div> : <><p className="truncate text-sm" title={row.name}>{row.name}</p><p className="mt-1 text-[11px] text-muted-foreground">{row.doc.image?.width} × {row.doc.image?.height} · {new Date(row.updatedAt).toLocaleDateString()}</p></>}</div>
            {!renaming && <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(async () => prepareLoad(await readTemplate(row.id)))}>加载</Button>
              <Button size="sm" variant="outline" disabled={busy || !image} onClick={() => void run(async () => prepareLoad(await readTemplate(row.id), true))}>套用</Button>
              <Button variant="ghost" size="icon-sm" disabled={busy} aria-label={`重命名 ${row.name}`} onClick={() => setRenaming({ id: row.id, name: row.name })}><Pencil /></Button>
              <Button variant="ghost" size="icon-sm" disabled={busy} aria-label={`备份 ${row.name}`} onClick={() => void run(async () => { const saved = await readTemplate(row.id); await exportTemplate(row.name, saved.doc, saved.blob) })}><Download /></Button>
              <Button variant="ghost" size="icon-sm" disabled={busy} aria-label={`删除 ${row.name}`} onClick={() => setConfirmation({ type: 'delete', id: row.id })}><Trash2 /></Button>
            </div>}
          </div>)}
        </ScrollArea>
        <input ref={fileInput} type="file" className="hidden" accept=".json" aria-label="导入模板文件" onChange={e => { const file = e.target.files?.[0]; if (file) void run(async () => prepareLoad(await importTemplate(file))); e.target.value = '' }} />
      </DialogContent>
    </Dialog>
    <Dialog open={!!confirmation} onOpenChange={value => { if (!value && !busy) setConfirmation(null) }}><DialogContent onInteractOutside={e => { if (busy) e.preventDefault() }} onEscapeKeyDown={e => { if (busy) e.preventDefault() }}><DialogHeader>
      <DialogTitle>{confirmation?.type === 'delete' ? '删除这个模板？' : confirmation?.currentImage ? '套用到当前图片？' : '加载这个模板？'}</DialogTitle>
      <DialogDescription>{confirmation?.type === 'delete' ? '删除后无法从模板列表恢复，当前画布不受影响。' : confirmation?.currentImage ? '保留当前图片，替换线条和组群布局。套用后可以撤销。' : '将替换当前图片和布局。加载后可以撤销恢复。'}</DialogDescription>
    </DialogHeader>
      {confirmation?.type === 'load' && confirmation.currentImage && !sameSize(confirmation.template.doc.image!, confirmation.currentImage) && <div className="space-y-2 rounded-lg border bg-secondary p-3 text-xs leading-6"><p>模板尺寸：{confirmation.template.doc.image!.width} × {confirmation.template.doc.image!.height}<br />当前图片：{confirmation.currentImage.width} × {confirmation.currentImage.height}</p><p>尺寸不同。线条保留原坐标，不缩放；裁剪选区将清空。超出图片的线条会隐藏，可手动移回。</p></div>}
      <DialogFooter><Button variant="outline" disabled={busy} onClick={() => setConfirmation(null)}>取消</Button><Button variant={confirmation?.type === 'delete' ? 'destructive' : 'default'} disabled={busy} onClick={confirm}>{busy ? '正在处理' : confirmation?.type === 'delete' ? '删除' : confirmation?.currentImage ? '套用布局' : '加载'}</Button></DialogFooter></DialogContent></Dialog>
  </>
}
