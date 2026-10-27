import type { ReactNode } from 'react'
import { Image } from 'lucide-react'
import { useEditor } from '../model/store'
import { HistoryToolBar } from './HistoryToolBar'

export function CanvasWorkspace({ busy, children }: { busy: boolean; children: ReactNode }) {
  const image = useEditor(state => state.present.doc.image)
  return <section aria-label="图片工作区" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card">
    <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <Image aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-xs font-medium" title={image?.name}>{image?.name ?? '图片画布'}</span>
      </div>
      <HistoryToolBar busy={busy} />
    </div>
    {children}
  </section>
}
