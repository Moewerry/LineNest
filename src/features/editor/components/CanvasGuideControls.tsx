import { ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type CanvasGuides = {
  center: boolean
  horizontal: boolean
  vertical: boolean
  thirds: boolean
}

export const emptyCanvasGuides: CanvasGuides = { center: false, horizontal: false, vertical: false, thirds: false }

const options = [
  { key: 'center', label: '图片中心点' },
  { key: 'horizontal', label: '水平中线' },
  { key: 'vertical', label: '垂直中线' },
  { key: 'thirds', label: '九宫格' },
] as const

type Props = {
  guides: CanvasGuides
  busy: boolean
  onChange: (guides: CanvasGuides) => void
}

export function CanvasGuideControls({ guides, busy, onChange }: Props) {
  const active = Object.values(guides).some(Boolean)
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant={active ? 'selected' : 'ghost'} size="icon-sm" aria-label="辅助线设置" title="辅助线设置" disabled={busy}>
        <ScanLine />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent data-canvas-guide-menu align="end" side="top" sideOffset={12} className="w-48 space-y-2 border-0 p-2 shadow-none">
      <DropdownMenuLabel>辅助线</DropdownMenuLabel>
      {options.map(option => <DropdownMenuCheckboxItem key={option.key} checked={guides[option.key]} disabled={busy} className="min-h-9"
        onSelect={event => event.preventDefault()}
        onCheckedChange={checked => onChange({ ...guides, [option.key]: checked === true })}>
        {option.label}
      </DropdownMenuCheckboxItem>)}
      <DropdownMenuItem disabled={busy || !active} className="min-h-9 pl-8" onClick={() => onChange({ ...emptyCanvasGuides })}>隐藏全部辅助线</DropdownMenuItem>
      <p className="px-2 py-1.5 text-xs text-[var(--workspace-muted-foreground)]">仅辅助查看，不参与导出</p>
    </DropdownMenuContent>
  </DropdownMenu>
}
