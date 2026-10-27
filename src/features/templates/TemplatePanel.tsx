import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, LoaderCircle, Search } from 'lucide-react'
import { toast } from '@/lib/toast'
import { liveQuery } from 'dexie'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { deleteTemplate, listTemplates, readTemplate, renameTemplate, type TemplateRecord } from '@/lib/db'
import { useEditor } from '@/features/editor/model/store'
import { exportTemplate, importTemplate } from './portable'
import { lineTemplateFromDocument, type LineTemplate } from './layout'
import { TemplateConfirmation, type TemplateConfirmationState } from './TemplateConfirmation'
import { TemplateListItem } from './TemplateListItem'
import { TemplateToolbar } from './TemplateToolbar'
import { pickUpTemplate } from './apply'

const message = (error: unknown) => error instanceof Error ? error.message : '操作失败，请检查浏览器存储权限或可用空间'

export function TemplatePanel({ disabled, onCountChange }: { disabled: boolean; onCountChange: (count: number | null) => void }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false), [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [rows, setRows] = useState<TemplateRecord[]>([]), [search, setSearch] = useState('')
  const [confirmation, setConfirmation] = useState<TemplateConfirmationState | null>(null)
  const fileInput = useRef<HTMLInputElement>(null), operation = useRef(false)
  const image = useEditor(s => s.present.doc.image)
  const filtered = rows.filter(row => row.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
  useEffect(() => {
    const subscription = liveQuery(listTemplates).subscribe({
      next: list => { setRows(list); setLoading(false); setLoadError(false); onCountChange(list.length) },
      error: error => { setLoading(false); setLoadError(true); onCountChange(null); toast.error(message(error)) },
    })
    return () => subscription.unsubscribe()
  }, [onCountChange])
  const run = async (action: () => Promise<void>) => {
    if (operation.current || disabled) return false
    operation.current = true; setBusy(true)
    try { await action(); return true } catch (error) { toast.error(message(error)); return false }
    finally { operation.current = false; setBusy(false) }
  }
  const prepareApply = (template: LineTemplate, name?: string) => {
    pickUpTemplate(template, name)
  }
  const confirm = () => void run(async () => {
    if (!confirmation) return
    await deleteTemplate(confirmation.id); setConfirmation(null); toast.success('已删除模板')
  })
  return <>
    <div className="px-4 pb-4 pt-5"><h2 className="text-sm font-semibold">我的模板</h2><p className="mt-1.5 text-xs leading-5 text-muted-foreground">保存画好的线条，下次直接复用。</p></div>
    <TemplateToolbar disabled={disabled || busy} hasImage={!!image}
      onBatch={() => void navigate('/batch')}
      onImport={() => fileInput.current?.click()}
      onExport={() => void run(async () => { exportTemplate('线条模板', lineTemplateFromDocument(useEditor.getState().present.doc)) })}
    />
    {(rows.length > 4 || search) && <div data-editor-settings className="relative mx-4 mb-4"><Search aria-hidden="true" className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索模板" aria-label="搜索我的模板" className="h-10 pl-9 shadow-none" /></div>}
    {loading || loadError || !rows.length ? <div role="status" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
      {loading ? <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-muted-foreground/50 motion-reduce:animate-none" /> : <FolderOpen aria-hidden="true" className="size-8 text-muted-foreground/35" />}
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">{loading ? '正在读取模板' : loadError ? '暂时无法读取模板' : '暂无模板'}</p>
        {!loading && <p className="text-xs leading-5 text-muted-foreground/70">{loadError ? '请刷新页面重试' : image ? '画好线条后，点击上方「保存为模板」' : '导入图片后即可创建和套用'}</p>}
      </div>
    </div> : <ScrollArea className="min-h-0 flex-1">
      <div data-editor-settings className="space-y-3 px-4 pb-4">
        {filtered.map(row => <TemplateListItem key={row.id} template={row} disabled={disabled || busy} hasImage={!!image}
          onApply={() => void run(async () => prepareApply(await readTemplate(row.id), row.name))}
          onBatch={() => void navigate(`/batch?template=${encodeURIComponent(row.id)}`)}
          onExport={() => void run(async () => { exportTemplate(row.name, await readTemplate(row.id)) })}
          onDelete={() => setConfirmation({ type: 'delete', id: row.id })}
          onRename={nextName => run(async () => { await renameTemplate(row.id, nextName); toast.success('模板已重命名') })}
        />)}
        {!filtered.length && <p role="status" className="py-8 text-center text-xs text-muted-foreground">没有找到匹配的模板</p>}
      </div>
    </ScrollArea>}
    <input ref={fileInput} type="file" className="hidden" accept=".json" aria-label="导入模板文件" disabled={disabled || busy || !image} onChange={event => {
      const file = event.target.files?.[0]
      if (file) void run(async () => prepareApply(await importTemplate(file), file.name.replace(/\.json$/i, '')))
      event.target.value = ''
    }} />
    <p className="shrink-0 border-t px-4 py-3 text-center text-[11px] leading-5 text-muted-foreground/70">模板保存在此浏览器，建议定期导出备份</p>
    <TemplateConfirmation confirmation={confirmation} busy={busy} disabled={disabled} onCancel={() => setConfirmation(null)} onConfirm={confirm} />
  </>
}
