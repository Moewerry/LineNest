import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkspaceModeSwitch } from '@/components/WorkspaceModeSwitch'
import { downloadBlob } from '@/lib/download'
import { BatchImageList } from './BatchImageList'
import { BatchPreview } from './BatchPreview'
import { BatchWorkflow } from './BatchWorkflow'
import { BatchEmptyState } from './BatchEmptyState'
import { BatchTemplatesDialog } from './BatchTemplatesDialog'
import { useBatch } from './use-batch'
import '@/features/editor/editor-theme.css'
import { ExportConfirmDialog } from '@/features/export/ExportConfirmDialog'
import { exportBase, type ExportOptions } from '@/lib/export/options'

export function BatchPage() {
  const [params] = useSearchParams()
  const batch = useBatch(params.get('template'))
  const input = useRef<HTMLInputElement>(null), templateInput = useRef<HTMLInputElement>(null)
  const [activeId, setActiveId] = useState('')
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [confirmedTemplates, setConfirmedTemplates] = useState<string | null>(null)
  const busy = batch.importing || batch.running
  const active = batch.items.find(item => item.id === activeId) ?? batch.items[0]
  const selected = batch.templates.filter(template => batch.selected.includes(template.id))
  const templateSelection = JSON.stringify([selected.map(template => template.id).sort(), batch.fit])
  const currentStep = batch.running ? 3 : templatesOpen ? 2 : batch.importing || !batch.items.length ? 1 : batch.result ? 4 : !selected.length || confirmedTemplates !== templateSelection ? 2 : 3
  const finished = batch.items.filter(item => item.status === 'done' || item.status === 'error').length
  const failed = batch.items.filter(item => item.status === 'error').length
  const status = batch.running ? `正在裁剪 ${finished} / ${batch.items.length}` : batch.result ? `已生成 ${batch.result.total} 张${failed ? ` · ${failed} 张原图有失败，见图片列表` : ''}` : ''
  const download = () => { if (batch.result) setDownloadOpen(true) }
  const confirmDownload = async (options: ExportOptions) => {
    const output = await batch.start(options)
    if (!output) throw new Error('导出已取消，请重新下载')
    downloadBlob(output.blob, `${exportBase(options, batch.items[0]?.file.name ?? 'images')}-batch.zip`)
  }

  return <div className="editor-workspace flex h-dvh flex-col overflow-hidden bg-background">
    <header className="shrink-0 bg-card"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-8 sm:py-4">
      <div className="flex items-center gap-3"><Button asChild={!busy} disabled={busy} variant="ghost" size="icon-sm" aria-label="返回首页">{busy ? <ArrowLeft /> : <Link to="/"><ArrowLeft /></Link>}</Button><span className="font-brand text-xl font-semibold">LineNest</span></div>
      <WorkspaceModeSwitch mode="batch" disabled={busy} />
    </div></header>
    <main className="min-h-0 flex-1 overflow-y-auto" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (!busy) void batch.addFiles(Array.from(event.dataTransfer.files)) }}>
      <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-7 sm:px-8 sm:py-8">
        {currentStep === 1 && <div><h1 className="text-2xl font-semibold tracking-tight">批量裁剪</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">添加图片，套用模板，预览后统一导出。</p></div>}
        {active ? <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <section className="min-w-0 rounded-2xl border bg-card p-4"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">图片 <span className="ml-1 text-xs font-normal text-muted-foreground">{batch.items.length} / 100</span></h2><Button variant="ghost" size="sm" disabled={busy} onClick={batch.clear}>清空</Button></div><BatchImageList items={batch.items} active={active.id} disabled={busy} onActive={setActiveId} onRemove={batch.remove} /></section>
          <BatchPreview key={JSON.stringify([active.id, selected.map(template => template.id)])} item={active} templates={selected} fit={batch.fit} disabled={busy} running={batch.running} status={status} total={batch.result?.total} onDownload={download} onEdit={batch.editPreview} onOffset={batch.updateOffset} onLineOffset={batch.updateLineOffset} onReset={batch.resetPosition} />
        </div> : <BatchEmptyState busy={busy} importing={batch.importing} onAdd={() => input.current?.click()} />}
        {batch.templateError && <p role="alert" className="text-sm text-destructive">模板读取失败：{batch.templateError}</p>}
        {batch.error && <p role="alert" className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-destructive/5 p-3 text-sm text-destructive">{batch.error}</p>}
      </div>
    </main>
    <BatchWorkflow busy={busy} running={batch.running} importing={batch.importing} count={batch.items.length} selected={selected.length} total={batch.result?.total} status={status} currentStep={currentStep}
      onAdd={() => input.current?.click()} onTemplates={() => setTemplatesOpen(true)} onCrop={() => void batch.start()} onCancel={batch.cancel}
      onDownload={download} />
    <BatchTemplatesDialog open={templatesOpen} onOpenChange={setTemplatesOpen} templates={batch.templates} selected={batch.selected} fit={batch.fit} disabled={busy} loading={batch.loading} error={batch.templateError} onToggle={batch.toggleTemplate} onFit={batch.changeFit} onImport={() => templateInput.current?.click()} onConfirm={() => setConfirmedTemplates(templateSelection)} />
    {downloadOpen && <ExportConfirmDialog sources={batch.items.map(item => item.file.name)} onClose={() => setDownloadOpen(false)} onConfirm={confirmDownload} />}
    <input ref={input} type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" aria-label="批量添加图片" className="hidden" disabled={busy} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ''; void batch.addFiles(files) }} />
    <input ref={templateInput} type="file" accept=".json" aria-label="导入裁剪模板" className="hidden" disabled={busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void batch.addTemplate(file) }} />
  </div>
}
