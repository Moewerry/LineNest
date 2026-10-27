import { useState } from 'react'
import { Download, MoreHorizontal, Pencil, Scissors, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { TemplateRecord } from '@/lib/db'
import { TemplateThumbnail } from './TemplateThumbnail'

export function TemplateListItem({ template, disabled, hasImage, onApply, onBatch, onExport, onDelete, onRename }: {
  template: TemplateRecord; disabled: boolean; hasImage: boolean
  onApply: () => void; onBatch: () => void; onExport: () => void; onDelete: () => void
  onRename: (name: string) => Promise<boolean>
}) {
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(template.name)
  return <article className="rounded-xl border bg-card p-3.5">
    <div className="flex items-center gap-3">
      <TemplateThumbnail layout={template.layout} className="h-16 w-20 rounded-lg p-2" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium" title={template.name}>{template.name}</h3>
        <p className="mt-1.5 text-[11px] text-muted-foreground">{template.layout.width} × {template.layout.height}</p>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between gap-2">
      <Button size="sm" variant="secondary" className="flex-1 text-xs" disabled={disabled || !hasImage} title={hasImage ? '拿起模板后在画布中单击放置' : '请先导入图片'} onClick={onApply}>拿起模板</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" disabled={disabled} aria-label={`${template.name}的更多操作`}><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={disabled} onSelect={onBatch}><Scissors />批量裁剪</DropdownMenuItem>
          <DropdownMenuItem disabled={disabled} onSelect={() => { setName(template.name); setRenaming(true) }}><Pencil />重命名</DropdownMenuItem>
          <DropdownMenuItem disabled={disabled} onSelect={onExport}><Download />导出模板</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={disabled} variant="destructive" onSelect={onDelete}><Trash2 />删除模板</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <Dialog open={renaming} onOpenChange={open => { if (!disabled) setRenaming(open) }}>
      <DialogContent>
        <DialogHeader icon={<Pencil />}><DialogTitle>重命名模板</DialogTitle><DialogDescription>给模板一个方便辨认的名称。</DialogDescription></DialogHeader>
        <form className="space-y-6" onSubmit={async event => { event.preventDefault(); if (await onRename(name)) setRenaming(false) }}>
          <Input aria-label="新模板名称" maxLength={80} value={name} disabled={disabled} onChange={event => setName(event.target.value)} />
          <DialogFooter><Button type="button" variant="outline" disabled={disabled} onClick={() => setRenaming(false)}>取消</Button><Button type="submit" disabled={disabled || !name.trim()}>保存名称</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </article>
}
