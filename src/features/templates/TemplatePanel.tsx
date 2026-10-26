import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Pencil, Plus, Scissors, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { liveQuery } from 'dexie'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteTemplate, listTemplates, readTemplate, renameTemplate, saveTemplate, type TemplateRecord } from '@/lib/db'
import { useEditor } from '@/features/editor/model/store'
import { exportTemplate, importTemplate } from './portable'
import { lineTemplateFromDocument, type LineTemplate } from './layout'
import { TemplateConfirmation, type TemplateConfirmationState } from './TemplateConfirmation'
import { TemplateThumbnail } from './TemplateThumbnail'
import { applyTemplate } from './apply'

const message = (error: unknown) => error instanceof Error ? error.message : '操作失败，请检查浏览器存储权限或可用空间'

export function TemplatePanel({ disabled, onCountChange }: { disabled: boolean; onCountChange: (count: number | null) => void }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false), [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [rows, setRows] = useState<TemplateRecord[]>([]), [name, setName] = useState('')
  const [confirmation, setConfirmation] = useState<TemplateConfirmationState | null>(null), [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null), operation = useRef(false)
  const image = useEditor(s => s.present.doc.image)
  useEffect(() => {
    const subscription = liveQuery(listTemplates).subscribe({
      next: list => { setRows(list); setLoading(false); setLoadError(false); onCountChange(list.length) },
      error: error => { setLoading(false); setLoadError(true); onCountChange(null); toast.error(message(error)) },
    })
    return () => subscription.unsubscribe()
  }, [onCountChange])
  const run = async (action: () => Promise<void>) => {
    if (operation.current || disabled) return
    operation.current = true; setBusy(true)
    try { await action() } catch (error) { toast.error(message(error)) }
    finally { operation.current = false; setBusy(false) }
  }
  const prepareApply = (template: LineTemplate) => {
    const currentImage = useEditor.getState().present.doc.image
    if (!currentImage) throw new Error('请先导入图片，再套用线条模板')
    setConfirmation({ type: 'apply', template, currentImage })
  }
  const confirm = () => void run(async () => {
    if (!confirmation) return
    if (confirmation.type === 'delete') {
      await deleteTemplate(confirmation.id); setConfirmation(null); toast.success('已删除模板'); return
    }
    applyTemplate(confirmation.template, confirmation.currentImage)
    setConfirmation(null); toast.success('线条已套用')
  })
  return <>
    <ScrollArea className="min-h-0 flex-1">
      <fieldset data-editor-settings disabled={disabled || busy} className="min-w-0 space-y-4 p-3">
        <Button variant="outline" className="w-full" disabled={disabled || busy} onClick={() => void navigate('/batch')}><Scissors />批量裁剪图片</Button>
        {!image && <p className="text-xs leading-5 text-muted-foreground">请先导入图片，再保存或套用线条模板。</p>}
        <form className="space-y-2" onSubmit={e => { e.preventDefault(); void run(async () => { await saveTemplate(name, structuredClone(useEditor.getState().present.doc)); setName(''); toast.success('已保存') }) }}>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="模板名称" aria-label="模板名称" maxLength={80} disabled={busy || disabled || !image} />
          <Button type="submit" disabled={busy || disabled || !image || !name.trim()} className="w-full"><Plus />新增模板（仅保存线条）</Button>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3"><span className="text-xs text-muted-foreground">{loading ? '正在读取' : loadError ? '读取失败' : `${rows.length} 个模板`}</span><div className="flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" disabled={busy || disabled || !image} onClick={() => fileInput.current?.click()}><Upload />导入文件</Button>
          <Button variant="ghost" size="sm" disabled={busy || disabled || !image} onClick={() => void run(async () => {
            const doc = useEditor.getState().present.doc
            exportTemplate(name.trim() || '线条模板', lineTemplateFromDocument(doc))
          })}><Download />导出当前线条</Button>
        </div></div>
        <div>
          {loading ? <p className="py-10 text-center text-xs text-muted-foreground">正在读取模板</p> : loadError ? <p className="py-10 text-center text-xs text-muted-foreground">无法读取模板，请检查浏览器存储权限后刷新页面。</p> : !rows.length ? <p className="py-10 text-center text-xs text-muted-foreground">暂无模板，保存当前线条即可新增。</p> : rows.map(row => <div key={row.id} className="space-y-3 border-b py-3 last:border-0">
            <div className="flex items-center gap-3"><TemplateThumbnail layout={row.layout} />
            <div className="min-w-0 flex-1">{renaming?.id === row.id ? <div className="flex flex-wrap gap-1"><Input value={renaming.name} maxLength={80} className="h-8 w-full" aria-label="新模板名称" onChange={e => setRenaming({ ...renaming, name: e.target.value })} /><Button size="sm" disabled={busy || disabled || !renaming.name.trim()} onClick={() => void run(async () => { await renameTemplate(row.id, renaming.name); setRenaming(null) })}>保存</Button><Button variant="ghost" size="sm" onClick={() => setRenaming(null)}>取消</Button></div> : <><p className="truncate text-sm" title={row.name}>{row.name}</p><p className="mt-1 text-[11px] text-muted-foreground">{row.layout.width} × {row.layout.height} · {new Date(row.updatedAt).toLocaleDateString()}</p></>}</div></div>
            {!renaming && <div className="flex flex-wrap items-center gap-1">
              <Button size="sm" variant="outline" disabled={busy || disabled || !image} onClick={() => void run(async () => prepareApply(await readTemplate(row.id)))}>套用</Button>
              <Button size="sm" variant="outline" disabled={busy || disabled} onClick={() => void navigate(`/batch?template=${encodeURIComponent(row.id)}`)}><Scissors />批量裁剪</Button>
              <Button variant="ghost" size="icon-sm" disabled={busy || disabled} aria-label={`重命名 ${row.name}`} onClick={() => setRenaming({ id: row.id, name: row.name })}><Pencil /></Button>
              <Button variant="ghost" size="icon-sm" disabled={busy || disabled} aria-label={`备份 ${row.name}`} onClick={() => void run(async () => { const saved = await readTemplate(row.id); exportTemplate(row.name, saved) })}><Download /></Button>
              <Button variant="ghost" size="icon-sm" disabled={busy || disabled} aria-label={`删除 ${row.name}`} onClick={() => setConfirmation({ type: 'delete', id: row.id })}><Trash2 /></Button>
            </div>}
          </div>)}
        </div>
        <input ref={fileInput} type="file" className="hidden" accept=".json" aria-label="导入模板文件" onChange={e => { const file = e.target.files?.[0]; if (file) void run(async () => prepareApply(await importTemplate(file))); e.target.value = '' }} />
      </fieldset>
    </ScrollArea>
    <p className="shrink-0 border-t px-3 py-3 text-[11px] leading-5 text-muted-foreground">仅保存线条与分组，不保存图片、裁剪或区域标记。保存在当前浏览器，可导出文件备份。</p>
    <TemplateConfirmation confirmation={confirmation} busy={busy} disabled={disabled} onCancel={() => setConfirmation(null)} onConfirm={confirm} />
  </>
}
