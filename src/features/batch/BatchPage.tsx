import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkspaceModeSwitch } from '@/components/WorkspaceModeSwitch'
import { downloadBlob } from '@/lib/download'
import { BatchImageList } from './BatchImageList'
import { BatchPreview } from './BatchPreview'
import { BatchWorkflow } from './BatchWorkflow'
import { BatchTemplatesDialog } from './BatchTemplatesDialog'
import { useBatch } from './use-batch'
import '@/features/editor/editor-theme.css'

export function BatchPage() {
  const [params] = useSearchParams()
  const batch = useBatch(params.get('template'))
  const input = useRef<HTMLInputElement>(null), templateInput = useRef<HTMLInputElement>(null)
  const [activeId, setActiveId] = useState('')
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [confirmedTemplates, setConfirmedTemplates] = useState<string | null>(null)
  const busy = batch.importing || batch.running
  const active = batch.items.find(item => item.id === activeId) ?? batch.items[0]
  const selected = batch.templates.filter(template => batch.selected.includes(template.id))
  const templateSelection = JSON.stringify([selected.map(template => template.id).sort(), batch.fit])
  const currentStep = batch.running ? 3 : templatesOpen ? 2 : batch.importing || !batch.items.length ? 1 : batch.result ? 4 : !selected.length || confirmedTemplates !== templateSelection ? 2 : 3
  const finished = batch.items.filter(item => item.status === 'done' || item.status === 'error').length
  const failed = batch.items.filter(item => item.status === 'error').length
  const status = batch.running ? `正在裁剪 ${finished} / ${batch.items.length}` : batch.result ? `已生成 ${batch.result.total} 张${failed ? ` · ${failed} 张原图有失败，见图片列表` : ''}` : ''
  const download = () => { if (batch.result) downloadBlob(batch.result.blob, 'LineNest-批量裁剪.zip') }

  return <div className="editor-workspace flex h-dvh flex-col overflow-hidden bg-background">
    <header className="shrink-0 border-b"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div className="flex items-center gap-3"><Button asChild={!busy} disabled={busy} variant="ghost" size="icon-sm" aria-label="返回首页">{busy ? <ArrowLeft /> : <Link to="/"><ArrowLeft /></Link>}</Button><h1 className="text-xl font-semibold">批量裁剪图片</h1></div>
      <WorkspaceModeSwitch mode="batch" disabled={busy} />
    </div></header>
    <main className="min-h-0 flex-1 overflow-y-auto" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (!busy) void batch.addFiles(Array.from(event.dataTransfer.files)) }}>
      <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-5 px-5 py-7">
        {active ? <div className="grid items-start gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-base font-semibold">图片 <span className="text-xs font-normal text-muted-foreground">{batch.items.length} / 100</span></h2><Button variant="ghost" size="sm" disabled={busy} onClick={batch.clear}>清空</Button></div><BatchImageList items={batch.items} active={active.id} disabled={busy} onActive={setActiveId} onRemove={batch.remove} /></section>
          <BatchPreview item={active} templates={selected} fit={batch.fit} disabled={busy} running={batch.running} status={status} total={batch.result?.total} onDownload={download} onEdit={batch.editPreview} onOffset={batch.updateOffset} onLineOffset={batch.updateLineOffset} onReset={batch.resetPosition} />
        </div> : <div className="flex min-h-64 flex-1 items-center justify-center"><Button variant="outline" disabled={busy} onClick={() => input.current?.click()} className="h-24 w-52 border-dashed text-muted-foreground shadow-none">{batch.importing ? '正在读取图片…' : '请上传图片'}</Button></div>}
        {batch.templateError && <p role="alert" className="text-sm text-destructive">模板读取失败：{batch.templateError}</p>}
        {batch.error && <p role="alert" className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-destructive/5 p-3 text-sm text-destructive">{batch.error}</p>}
      </div>
    </main>
    <BatchWorkflow busy={busy} running={batch.running} importing={batch.importing} count={batch.items.length} selected={selected.length} total={batch.result?.total} status={status} currentStep={currentStep}
      onAdd={() => input.current?.click()} onTemplates={() => setTemplatesOpen(true)} onCrop={() => void batch.start()} onCancel={batch.cancel}
      onDownload={download} />
    <BatchTemplatesDialog open={templatesOpen} onOpenChange={setTemplatesOpen} templates={batch.templates} selected={batch.selected} fit={batch.fit} disabled={busy} loading={batch.loading} error={batch.templateError} onToggle={batch.toggleTemplate} onFit={batch.changeFit} onImport={() => templateInput.current?.click()} onConfirm={() => setConfirmedTemplates(templateSelection)} />
    <input ref={input} type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" aria-label="批量添加图片" className="hidden" disabled={busy} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ''; void batch.addFiles(files) }} />
    <input ref={templateInput} type="file" accept=".json" aria-label="导入裁剪模板" className="hidden" disabled={busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void batch.addTemplate(file) }} />
  </div>
}
