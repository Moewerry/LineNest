import { useState } from 'react'
import { FolderOpen, Layers } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplatePanel } from '@/features/templates/TemplatePanel'
import { ObjectPanel } from './ObjectPanel'

export function EditorSidebar({ disabled, open }: { disabled: boolean; open: boolean }) {
  const [templateCount, setTemplateCount] = useState<number | null>(null)

  return <aside aria-label="模板与图层" className={`${open ? 'flex' : 'hidden'} w-[320px] shrink-0 flex-col border-l bg-card`}>
    <Tabs defaultValue="templates" className="min-h-0 flex-1 gap-0">
      <div className="flex shrink-0 items-center px-4 pt-4 pb-3">
        <TabsList data-editor-settings aria-label="侧边栏内容" className="h-12 w-full bg-secondary/70 p-1">
          <TabsTrigger className="h-full py-2 data-[state=active]:shadow-none" value="templates"><FolderOpen className="size-3.5" />模板<span className="min-w-4 text-[10px] text-muted-foreground tabular-nums" aria-live="polite">{templateCount ?? '…'}</span></TabsTrigger>
          <TabsTrigger className="h-full py-2 data-[state=active]:shadow-none" value="layers"><Layers className="size-3.5" />图层</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="templates" forceMount className="flex flex-col"><TemplatePanel disabled={disabled} onCountChange={setTemplateCount} /></TabsContent>
      <TabsContent value="layers" className="flex flex-col"><ObjectPanel /></TabsContent>
    </Tabs>
  </aside>
}
