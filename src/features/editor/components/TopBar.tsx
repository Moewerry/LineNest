import { useRef, type ReactNode } from 'react'
import { ChevronDown, Home, ImagePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Brand } from '@/components/Brand'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useEditor } from '../model/store'
import { HistoryToolBar } from './HistoryToolBar'
export function TopBar({ onImport, busy, busyLabel = '正在读取', children }: { onImport: (file: File) => void; busy: boolean; busyLabel?: string; children?: ReactNode }) {
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const image = useEditor(s => s.present.doc.image)
  return <header className="flex h-[72px] shrink-0 items-center gap-4 border-b bg-card px-5">
    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" disabled={busy} className="h-auto gap-2 px-0 hover:bg-transparent" aria-label="LineNest 菜单"><Brand /><ChevronDown className="size-3 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuItem onSelect={() => navigate('/')}><Home />返回首页</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    <span className="hidden min-w-0 truncate border-l pl-4 text-xs text-muted-foreground lg:block lg:max-w-80 xl:max-w-112" title={image?.name}>{image?.name ?? '未命名'}</span>
    <div className="ml-auto flex shrink-0 items-center gap-1">
      <HistoryToolBar busy={busy} />
      <span aria-hidden="true" className="mx-2 h-5 border-l" />
      <Button variant="outline" disabled={busy} onClick={() => input.current?.click()}><ImagePlus />{busy ? busyLabel : '导入图片'}</Button>
      {children}
    </div>
    <input ref={input} className="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/avif" aria-label="选择图片" onChange={e => { const file = e.target.files?.[0]; if (file) onImport(file); e.target.value = '' }} />
  </header>
}
