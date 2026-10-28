import { useState } from 'react'
import { Download, MoreHorizontal, Pencil, Scissors, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { TemplateRecord } from '@/lib/db'
import { TemplateThumbnail } from './TemplateThumbnail'
import { useTemplateCard } from './use-template-card'

export function TemplateListItem({ template, disabled, hasImage, onApply, onBatch, onExport, onDelete, onRename }: {
  template: TemplateRecord; disabled: boolean; hasImage: boolean
  onApply: () => void; onBatch: () => void; onExport: () => void; onDelete: () => void
  onRename: (name: string) => Promise<boolean>
}) {
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(template.name)
  const cardHandlers = useTemplateCard(template, disabled || !hasImage, onApply)
  return <article className="relative border-b border-dashed border-[var(--workspace-divider)] bg-card">
    <Button data-template-row variant="ghost" disabled={disabled || !hasImage} {...cardHandlers}
      aria-label={`套用模板：${template.name}`} title={hasImage ? '单击自动居中放置，拖动到画布指定位置' : '请先导入图片'}
      className="h-auto w-full justify-start gap-3 rounded-none p-3.5 pr-12 text-left whitespace-normal shadow-none enabled:cursor-grab enabled:active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-100">
      <TemplateThumbnail layout={template.layout} className="h-16 w-20 rounded-lg p-2" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{template.name}</span>
        <span className="mt-1.5 block text-[11px] text-muted-foreground">{template.layout.width} × {template.layout.height}</span>
      </span>
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" disabled={disabled} className="absolute right-2 top-1/2 -translate-y-1/2" aria-label={`${template.name}的更多操作`}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-[var(--workspace-divider)]">
        <DropdownMenuItem disabled={disabled} onSelect={onBatch}><Scissors />批量裁剪</DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onSelect={() => { setName(template.name); setRenaming(true) }}><Pencil />重命名</DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} onSelect={onExport}><Download />导出模板</DropdownMenuItem>
        <DropdownMenuItem disabled={disabled} variant="destructive" onSelect={onDelete}><Trash2 />删除模板</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
