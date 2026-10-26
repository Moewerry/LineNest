import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Download, Plus, Scissors, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadBlob } from '@/lib/download'
import { BatchTemplatePicker } from './BatchTemplatePicker'
import { BatchImageList } from './BatchImageList'
import { BatchPreview } from './BatchPreview'
import { useBatch } from './use-batch'

export function BatchPage() {
  const [params] = useSearchParams()
  const batch = useBatch(params.get('template'))
  const input = useRef<HTMLInputElement>(null), templateInput = useRef<HTMLInputElement>(null)
  const [activeId, setActiveId] = useState(''), [previewId, setPreviewId] = useState('')
  const busy = batch.importing || batch.running
  const active = batch.items.find(item => item.id === activeId) ?? batch.items[0]
  const selected = batch.templates.filter(template => batch.selected.includes(template.id))
  const preview = selected.find(template => template.id === previewId) ?? selected[0]
  const finished = batch.items.filter(item => item.status === 'done' || item.status === 'error').length
  const failed = batch.items.filter(item => item.status === 'error').length

  return <div className="min-h-dvh bg-background">
    <header className="border-b"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5">
      <div className="flex items-center gap-3"><Button asChild variant="ghost" size="icon-sm"><Link to="/editor" aria-label="返回工作台"><ArrowLeft /></Link></Button><h1 className="text-xl font-semibold">批量裁剪</h1></div>
      <span className="text-xs text-muted-foreground">添加图片 → 选择模板 → 裁剪下载</span>
    </div></header>
    <main className="mx-auto max-w-6xl space-y-7 px-5 py-7" onDragOver={e => { e.preventDefault() }} onDrop={e => { e.preventDefault(); if (!busy) void batch.addFiles(Array.from(e.dataTransfer.files)) }}>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">添加图片 <span className="text-xs font-normal text-muted-foreground">{batch.items.length} / 100</span></h2><div className="flex gap-2">
          <Button variant="outline" disabled={busy} onClick={() => templateInput.current?.click()}><Upload />导入模板</Button>
          <Button disabled={busy || batch.items.length >= 100} onClick={() => input.current?.click()}><Plus />{batch.importing ? '正在读取…' : '添加图片'}</Button>
        </div></div>
        {!batch.items.length && <Button variant="outline" className="h-36 w-full flex-col gap-3 border-dashed text-muted-foreground" disabled={busy} onClick={() => input.current?.click()}><Upload className="size-6" /><span>点击或拖入多张图片</span><span className="text-xs font-normal">PNG、JPG、WebP、AVIF · 每张不超过 40 MB</span></Button>}
      </section>
      {batch.loading ? <p role="status" className="text-sm text-muted-foreground">正在读取模板…</p> : <>
        {batch.templateError && <p role="alert" className="text-sm text-destructive">模板读取失败：{batch.templateError}</p>}
        {batch.templates.length ? <BatchTemplatePicker templates={batch.templates} selected={batch.selected} fit={batch.fit} disabled={busy} onToggle={batch.toggleTemplate} onFit={batch.changeFit} /> : <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4"><span className="text-sm text-muted-foreground">还没有模板</span><Button asChild variant="outline" size="sm"><Link to="/editor">去画线并保存模板</Link></Button></div>}
      </>}
      {active && <div className="grid items-start gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
        <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-base font-semibold">图片</h2><Button variant="ghost" size="sm" disabled={busy} onClick={batch.clear}>清空</Button></div><BatchImageList items={batch.items} active={active.id} disabled={busy} onActive={setActiveId} onRemove={batch.remove} /></section>
        <div className="min-w-0 space-y-3">{selected.length > 1 && <div className="flex flex-wrap gap-2" role="group" aria-label="切换预览模板">{selected.map(template => <Button key={template.id} size="sm" variant={template.id === preview?.id ? 'default' : 'outline'} aria-pressed={template.id === preview?.id} onClick={() => setPreviewId(template.id)}>{template.name}</Button>)}</div>}<BatchPreview item={active} template={preview} fit={batch.fit} disabled={busy} onOffset={batch.updateOffset} /></div>
      </div>}
      {batch.error && <p role="alert" className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-destructive/5 p-3 text-sm text-destructive">{batch.error}</p>}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
        <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {batch.running ? `正在裁剪 ${finished} / ${batch.items.length}` : batch.result ? `已生成 ${batch.result.total} 张${failed ? ` · ${failed} 张原图有失败，见图片列表` : ''}` : `${batch.items.length} 张图片 · ${selected.length} 个模板`}
        </div>
        <div className="flex flex-wrap gap-2">{batch.running ? <Button variant="outline" onClick={batch.cancel}>取消裁剪</Button> : <>
          <Button disabled={busy || !batch.items.length || !selected.length} onClick={() => void batch.start()}><Scissors />{batch.result ? '重新裁剪' : '一键批量裁剪'}</Button>
          {batch.result && <Button variant="outline" onClick={() => { if (batch.result) downloadBlob(batch.result.blob, 'LineNest-批量裁剪.zip') }}><Download />下载 ZIP</Button>}
        </>}</div>
      </footer>
    </main>
    <input ref={input} type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" aria-label="批量添加图片" className="hidden" disabled={busy} onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ''; void batch.addFiles(files) }} />
    <input ref={templateInput} type="file" accept=".json" aria-label="导入裁剪模板" className="hidden" disabled={busy} onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void batch.addTemplate(file) }} />
  </div>
}
