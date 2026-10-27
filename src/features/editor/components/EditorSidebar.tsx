import { useEffect, useId, useRef, useState } from 'react'
import { FolderOpen, Layers, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplatePanel } from '@/features/templates/TemplatePanel'
import { ObjectPanel } from './ObjectPanel'
import { SidebarResizeHandle } from './SidebarResizeHandle'

export function EditorSidebar({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(true)
  const [width, setWidth] = useState(304)
  const [maxWidth, setMaxWidth] = useState(560)
  const sidebar = useRef<HTMLElement>(null)
  const contentId = useId()
  const [templateCount, setTemplateCount] = useState<number | null>(null)

  useEffect(() => {
    const parent = sidebar.current?.parentElement
    if (!parent) return
    const observer = new ResizeObserver(([entry]) => {
      const limit = Math.max(260, Math.min(560, entry.contentRect.width - 500))
      setMaxWidth(limit)
      setWidth(current => Math.min(current, limit))
    })
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  const toggle = <Button variant="ghost" size="icon" className="shrink-0" aria-label={open ? '收起侧边栏' : '展开侧边栏'} aria-expanded={open} aria-controls={contentId} title={open ? '收起侧边栏' : '展开侧边栏'} onClick={() => setOpen(current => !current)}>{open ? <PanelRightClose /> : <PanelRightOpen />}</Button>

  return <aside ref={sidebar} aria-label="模板与图层" className="relative flex min-h-0 shrink-0 flex-col rounded-2xl border bg-card" style={{ width: open ? Math.min(width, maxWidth) : 52 }}>
    {open && <SidebarResizeHandle width={width} minWidth={260} maxWidth={maxWidth} onWidthChange={setWidth} controls={contentId} />}
    <Tabs defaultValue="templates" className="min-h-0 flex-1 gap-0">
      <div className="flex shrink-0 items-center gap-2 border-b px-2 py-2">
        <TabsList data-editor-settings aria-label="侧边栏内容" className={`${open ? 'inline-flex' : 'hidden'} h-10 min-w-0 flex-1 bg-transparent p-0`}>
          <TabsTrigger className="h-full py-2 data-[state=active]:bg-secondary data-[state=active]:shadow-none" value="templates"><FolderOpen className="size-3.5" />模板<span className="min-w-4 text-[10px] text-muted-foreground tabular-nums" aria-live="polite">{templateCount ?? '…'}</span></TabsTrigger>
          <TabsTrigger className="h-full py-2 data-[state=active]:bg-secondary data-[state=active]:shadow-none" value="layers"><Layers className="size-3.5" />图层</TabsTrigger>
        </TabsList>
        {toggle}
      </div>
      <div id={contentId} className={`${open ? 'flex' : 'hidden'} min-h-0 flex-1 flex-col`}>
        <TabsContent value="templates" forceMount className="flex flex-col"><TemplatePanel disabled={disabled} onCountChange={setTemplateCount} /></TabsContent>
        <TabsContent value="layers" className="flex flex-col"><ObjectPanel /></TabsContent>
      </div>
    </Tabs>
  </aside>
}
