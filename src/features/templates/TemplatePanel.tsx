import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FolderOpen, LoaderCircle, MoreHorizontal, Pencil, Plus, Scissors, Trash2 } from 'lucide-react'
import { toast } from '@/lib/toast'
import { liveQuery } from 'dexie'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { deleteTemplate, listTemplates, readTemplate, renameTemplate, saveTemplate, type TemplateRecord } from '@/lib/db'
import { useEditor } from '@/features/editor/model/store'
import { exportTemplate, importTemplate } from './portable'
import { lineTemplateFromDocument, type LineTemplate } from './layout'
import { TemplateConfirmation, type TemplateConfirmationState } from './TemplateConfirmation'
import { TemplateThumbnail } from './TemplateThumbnail'
import { TemplateToolbar } from './TemplateToolbar'
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
  const hasLines = useEditor(s => Object.values(s.present.doc.nodes).some(node => node.type === 'line'))
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
    <TemplateToolbar disabled={disabled || busy} hasImage={!!image}
      onBatch={() => void navigate('/batch')}
      onImport={() => fileInput.current?.click()}
      onExport={() => void run(async () => { exportTemplate(name.trim() || '线条模板', lineTemplateFromDocument(useEditor.getState().present.doc)) })}
    />
    {image && <form data-editor-settings className="flex shrink-0 items-center gap-2 px-4 pb-5" onSubmit={event => {
      event.preventDefault()
      void run(async () => { await saveTemplate(name, useEditor.getState().present.doc); setName(''); toast.success('已保存') })
    }}>
      <Input value={name} onChange={event => setName(event.target.value)} placeholder="模板名称" aria-label="模板名称" maxLength={80} disabled={busy || disabled} className="h-10 flex-1 border-transparent bg-secondary/60 shadow-none" />
      <Button type="submit" disabled={busy || disabled || !name.trim() || !hasLines} title={hasLines ? undefined : '请先绘制分割线'} className="h-10 gap-1.5 px-3 text-xs shadow-none"><Plus />保存</Button>
    </form>}
    {loading || loadError || !rows.length ? <div role="status" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
      {loading ? <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-muted-foreground/50 motion-reduce:animate-none" /> : <FolderOpen aria-hidden="true" className="size-8 text-muted-foreground/35" />}
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">{loading ? '正在读取模板' : loadError ? '暂时无法读取模板' : '暂无模板'}</p>
        {!loading && <p className="text-xs leading-5 text-muted-foreground/70">{loadError ? '请刷新页面重试' : image ? '输入名称，保存当前线条' : '导入图片后即可创建和套用'}</p>}
      </div>
    </div> : <ScrollArea className="min-h-0 flex-1">
      <fieldset data-editor-settings disabled={disabled || busy} className="min-w-0 space-y-5 px-4 pb-4">
        <div className="space-y-5">
          {rows.map(row => <div key={row.id} className="space-y-3">
            <div className="flex items-center gap-3"><TemplateThumbnail layout={row.layout} />
            <div className="min-w-0 flex-1">{renaming?.id === row.id ? <div className="flex flex-wrap gap-1"><Input value={renaming.name} maxLength={80} className="h-8 w-full bg-secondary/60 shadow-none" aria-label="新模板名称" onChange={e => setRenaming({ ...renaming, name: e.target.value })} /><Button size="sm" disabled={busy || disabled || !renaming.name.trim()} onClick={() => void run(async () => { await renameTemplate(row.id, renaming.name); setRenaming(null) })}>保存</Button><Button variant="ghost" size="sm" onClick={() => setRenaming(null)}>取消</Button></div> : <><p className="truncate text-sm" title={row.name}>{row.name}</p><p className="mt-1 text-[11px] text-muted-foreground">{row.layout.width} × {row.layout.height}</p></>}</div></div>
            {!renaming && <div className="flex flex-wrap items-center gap-1">
              <Button size="sm" variant="ghost" className="text-xs" disabled={busy || disabled || !image} title={image ? undefined : '请先导入图片'} onClick={() => void run(async () => prepareApply(await readTemplate(row.id)))}>套用</Button>
              <Button size="sm" variant="ghost" className="text-xs" disabled={busy || disabled} onClick={() => void navigate(`/batch?template=${encodeURIComponent(row.id)}`)}><Scissors />批量裁剪</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" className="ml-auto text-muted-foreground" disabled={busy || disabled} aria-label={`${row.name}的更多操作`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled={busy || disabled} onSelect={() => setRenaming({ id: row.id, name: row.name })}><Pencil />重命名</DropdownMenuItem>
                  <DropdownMenuItem disabled={busy || disabled} onSelect={() => void run(async () => { const saved = await readTemplate(row.id); exportTemplate(row.name, saved) })}><Download />导出模板</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" disabled={busy || disabled} onSelect={() => setConfirmation({ type: 'delete', id: row.id })}><Trash2 />删除</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>}
          </div>)}
        </div>
      </fieldset>
    </ScrollArea>}
    <input ref={fileInput} type="file" className="hidden" accept=".json" aria-label="导入模板文件" disabled={disabled || busy || !image} onChange={event => {
      const file = event.target.files?.[0]
      if (file) void run(async () => prepareApply(await importTemplate(file)))
      event.target.value = ''
    }} />
    <p className="shrink-0 px-4 py-4 text-center text-[11px] leading-5 text-muted-foreground/70">仅保存线条 · 本地存储 · 可导出备份</p>
    <TemplateConfirmation confirmation={confirmation} busy={busy} disabled={disabled} onCancel={() => setConfirmation(null)} onConfirm={confirm} />
  </>
}
