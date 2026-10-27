import { useRef, type ReactNode } from 'react'
import { ChevronDown, Home, ImagePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Brand } from '@/components/Brand'
import { WorkspaceModeSwitch } from '@/components/WorkspaceModeSwitch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useEditor } from '../model/store'
export function TopBar({ onImport, busy, busyLabel = '正在读取', children }: { onImport: (file: File) => void; busy: boolean; busyLabel?: string; children?: ReactNode }) {
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const image = useEditor(s => s.present.doc.image)
  return <header className="grid shrink-0 grid-cols-[1fr_auto] items-center gap-x-6 gap-y-4 border-b bg-card px-6 py-4 lg:grid-cols-[1fr_auto_1fr]">
    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" disabled={busy} className="h-auto justify-self-start gap-2 px-0 hover:bg-transparent" aria-label="LineNest 菜单"><Brand /><ChevronDown className="size-3 text-muted-foreground" /></Button></DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuItem onSelect={() => navigate('/')}><Home />返回首页</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    <div className="col-span-2 row-start-2 justify-self-center lg:col-span-1 lg:col-start-2 lg:row-start-1"><WorkspaceModeSwitch mode="editor" disabled={busy} /></div>
    <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-3 lg:col-start-3">
      <Button variant="ghost" disabled={busy} onClick={() => input.current?.click()}><ImagePlus />{busy ? busyLabel : image ? '替换图片' : '导入图片'}</Button>
      {children}
    </div>
    <input ref={input} className="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/avif" aria-label="选择图片" onChange={e => { const file = e.target.files?.[0]; if (file) onImport(file); e.target.value = '' }} />
  </header>
}
