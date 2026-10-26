import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BatchItem } from './types'

const status = (item: BatchItem) => item.status === 'working' ? `正在裁剪 · ${item.count ?? 0} 张` : item.status === 'done' ? `完成 · ${item.count} 张` : item.status === 'error' ? `有失败${item.count ? ` · 已生成 ${item.count} 张` : ''}` : '待裁剪'

export function BatchImageList({ items, active, disabled, onActive, onRemove }: {
  items: BatchItem[]; active?: string; disabled: boolean; onActive: (id: string) => void; onRemove: (id: string) => void
}) {
  return <div className="max-h-[480px] space-y-2 overflow-y-auto" aria-label="图片列表">
    {items.map(item => <div key={item.id} className={`flex items-center gap-2 rounded-lg border p-2 ${item.id === active ? 'border-primary bg-primary/5' : ''}`}>
      <Button variant="ghost" className="h-auto min-w-0 flex-1 justify-start gap-3 p-1 text-left" aria-pressed={item.id === active} onClick={() => onActive(item.id)}>
        <img src={item.url} alt="" loading="lazy" className="size-12 shrink-0 rounded object-contain" />
        <span className="min-w-0"><span className="block truncate" title={item.file.name}>{item.file.name}</span><span className="block text-xs font-normal text-muted-foreground">{item.width} × {item.height}</span><span className={`block text-xs font-normal ${item.status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>{status(item)}</span></span>
      </Button>
      <Button variant="ghost" size="icon-sm" disabled={disabled} aria-label={`移除 ${item.file.name}`} onClick={() => onRemove(item.id)}><X /></Button>
    </div>)}
  </div>
}
