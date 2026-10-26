import { FileArchive, Files } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SliceDownloadMode } from './types'

const options = [
  { id: 'zip', title: '打包下载', description: '一个 ZIP，包含全部所选图片', icon: FileArchive },
  { id: 'files', title: '逐张下载', description: '一键下载，每张都是独立图片', icon: Files },
] satisfies { id: SliceDownloadMode; title: string; description: string; icon: typeof Files }[]

export function SliceDownloadOptions({ value, disabled, onChange }: { value: SliceDownloadMode; disabled: boolean; onChange: (value: SliceDownloadMode) => void }) {
  return <section aria-label="下载方式" className="space-y-2.5">
    <h3 className="text-sm font-semibold">下载方式</h3>
    <div role="group" aria-label="下载方式" className="grid gap-2 sm:grid-cols-2">
      {options.map(({ id, title, description, icon: Icon }) => <Button key={id} variant="outline" aria-pressed={value === id} disabled={disabled} onClick={() => onChange(id)}
        className={cn('h-auto justify-start gap-3 rounded-xl p-3 text-left whitespace-normal shadow-none', value === id && 'border-primary/40 bg-primary/5 hover:bg-primary/10')}>
        <Icon aria-hidden="true" className={cn('size-5', value === id ? 'text-primary' : 'text-muted-foreground')} />
        <span className="space-y-1"><span className="block text-xs font-semibold">{title}</span><span className="block text-[11px] font-normal text-muted-foreground">{description}</span></span>
      </Button>)}
    </div>
    {value === 'files' && <p className="text-[11px] text-muted-foreground">浏览器提示时，请允许下载多个文件。</p>}
  </section>
}
