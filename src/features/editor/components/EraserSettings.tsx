import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EraserSettings({ busy, onDeleteImage }: { busy: boolean; onDeleteImage: () => void }) {
  return <div data-editor-settings aria-label="擦除设置" className="absolute bottom-14 left-10 z-10 w-72 max-w-[calc(100%-44px)] space-y-3 rounded-xl bg-card p-4 shadow-lg" onContextMenu={event => event.stopPropagation()}>
    <p className="text-sm font-medium">擦除设置</p>
    <p className="text-xs leading-relaxed text-muted-foreground">擦除范围为光标尖端周围 8 px，划过即删除整个对象。底图使用下方按钮删除，同时清空所有编辑内容，可撤销恢复。</p>
    <Button variant="destructive" size="sm" disabled={busy} onClick={onDeleteImage}><Trash2 className="size-4" />删除图片及全部内容</Button>
  </div>
}
