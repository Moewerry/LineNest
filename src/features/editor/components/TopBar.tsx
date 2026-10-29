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
  return <header className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-[var(--workspace-divider)] bg-card px-3 py-2 sm:gap-x-4 sm:gap-y-3 sm:px-6 sm:py-4">
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" disabled={busy} className="h-auto shrink-0 gap-1 px-0 hover:bg-transparent sm:gap-2" aria-label="LineNest 菜单"><Brand className="max-sm:[&>span]:hidden" iconClassName="max-sm:size-8" /><ChevronDown className="size-3 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuItem onSelect={() => navigate('/')}><Home />返回首页</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      <div className="hidden min-w-0 items-center gap-2.5 border-l pl-4 sm:flex">
        <Image aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-xs font-medium" title={image?.name}>{image?.name ?? '图片画布'}</span>
      </div>
    </div>
    <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-0.5 sm:gap-2">
      <HistoryToolBar busy={busy} />
      <Separator orientation="vertical" className="mx-1 hidden data-[orientation=vertical]:h-5 sm:block" />
      <WorkspaceModeSwitch mode="editor" disabled={busy} />
      <Button variant="toolbar" className="max-sm:size-9 max-sm:p-0 max-sm:has-[>svg]:px-0" aria-label={busy ? busyLabel : image ? '替换图片' : '导入图片'} disabled={busy} onClick={() => input.current?.click()}><ImagePlus /><span className="hidden sm:inline">{busy ? busyLabel : image ? '替换图片' : '导入图片'}</span></Button>
      {children}
    </div>
    <input ref={input} className="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/avif" aria-label="选择图片" onChange={e => { const file = e.target.files?.[0]; if (file) onImport(file); e.target.value = '' }} />
  </header>
}
