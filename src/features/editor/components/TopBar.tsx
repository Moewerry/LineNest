import { useRef, type ReactNode } from 'react'
import { ChevronDown, Home, Image, ImagePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Brand } from '@/components/Brand'
import { WorkspaceModeSwitch } from '@/components/WorkspaceModeSwitch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useEditor } from '../model/store'
import { HistoryToolBar } from './HistoryToolBar'
export function TopBar({ onImport, busy, busyLabel = '正在读取', children }: { onImport: (file: File) => void; busy: boolean; busyLabel?: string; children?: ReactNode }) {
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const image = useEditor(s => s.present.doc.image)
  return <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 border-b bg-card px-6 py-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
    <div className="flex min-w-0 items-center gap-4">
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" disabled={busy} className="h-auto shrink-0 gap-2 px-0 hover:bg-transparent" aria-label="LineNest 菜单"><Brand /><ChevronDown className="size-3 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuItem onSelect={() => navigate('/')}><Home />返回首页</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      <div className="flex min-w-0 items-center gap-2.5 border-l pl-4">
        <Image aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-xs font-medium" title={image?.name}>{image?.name ?? '图片画布'}</span>
      </div>
    </div>
    <div className="col-span-2 row-start-2 justify-self-center lg:col-span-1 lg:col-start-2 lg:row-start-1"><WorkspaceModeSwitch mode="editor" disabled={busy} /></div>
    <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-2 lg:col-start-3">
      <HistoryToolBar busy={busy} />
      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />
      <Button variant="ghost" disabled={busy} onClick={() => input.current?.click()}><ImagePlus />{busy ? busyLabel : image ? '替换图片' : '导入图片'}</Button>
      {children}
    </div>
    <input ref={input} className="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/avif" aria-label="选择图片" onChange={e => { const file = e.target.files?.[0]; if (file) onImport(file); e.target.value = '' }} />
  </header>
}
