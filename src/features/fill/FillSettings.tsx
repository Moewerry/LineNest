import { useEffect, useId, useState, type MouseEvent } from 'react'
import { Eraser, PaintBucket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEditor } from '@/features/editor/model/store'

type Props = { busy: boolean; loading: boolean; error: string }
const validColor = (color: string) => /^#[0-9a-f]{6}$/i.test(color)
const percentage = (opacity: number) => String(Number((opacity * 100).toFixed(2)))

export function FillSettings({ busy, loading, error }: Props) {
  const color = useEditor(state => state.fillColor), opacity = useEditor(state => state.fillOpacity)
  const action = useEditor(state => state.fillAction), count = useEditor(state => state.present.doc.marks?.length ?? 0)
  const [colorDraft, setColorDraft] = useState(color), [opacityDraft, setOpacityDraft] = useState(percentage(opacity))
  const colorId = useId(), opacityId = useId()
  useEffect(() => setColorDraft(color), [color])
  useEffect(() => setOpacityDraft(percentage(opacity)), [opacity])
  const opacityValue = opacityDraft.trim() ? Number(opacityDraft) : NaN
  const opacityValid = Number.isFinite(opacityValue) && opacityValue >= 0 && opacityValue <= 100
  const chooseAction = (value: 'mark' | 'erase', event: MouseEvent<HTMLButtonElement>) => {
    useEditor.getState().setFillAction(value)
    if (event.detail > 0) (event.currentTarget.closest('[data-canvas-shortcuts]') as HTMLElement | null)?.focus({ preventScroll: true })
  }

  return <section aria-label="色块标记选项">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xs font-semibold">标记设置</h2>
      <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">已标记 {count} 块</span>
    </div>
    <div role="group" aria-label="标记操作" className="mt-3 grid grid-cols-2 gap-2">
      <Button size="sm" variant={action === 'mark' ? 'default' : 'outline'} aria-pressed={action === 'mark'} disabled={busy} onClick={event => chooseAction('mark', event)}><PaintBucket className="size-3.5" />标记区域</Button>
      <Button size="sm" variant={action === 'erase' ? 'default' : 'outline'} aria-pressed={action === 'erase'} disabled={busy} onClick={event => chooseAction('erase', event)}><Eraser className="size-3.5" />清除标记</Button>
    </div>
    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
      <div className="min-w-0 space-y-1.5">
        <label htmlFor={colorId} className="text-[11px] text-muted-foreground">标记颜色</label>
        <div className="flex items-center gap-1.5">
          <Input type="color" aria-label="选择标记颜色" value={color} disabled={busy} className="h-8 w-9 shrink-0 cursor-pointer p-1" onChange={event => useEditor.getState().setFillColor(event.target.value)} />
          <Input id={colorId} aria-label="标记颜色 HEX" value={colorDraft} disabled={busy} maxLength={7} spellCheck={false} autoComplete="off" aria-invalid={!validColor(colorDraft)} className="h-8 min-w-0 flex-1 px-2 font-mono text-xs" onChange={event => {
            const value = event.target.value
            setColorDraft(value)
            if (validColor(value)) useEditor.getState().setFillColor(value)
          }} onBlur={() => { if (!validColor(colorDraft)) setColorDraft(useEditor.getState().fillColor) }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={opacityId} className="text-[11px] text-muted-foreground">颜色浓度</label>
        <div className="flex items-center gap-1.5">
          <Input id={opacityId} type="number" min={0} max={100} step={1} title="100% 为完全不透明" value={opacityDraft} disabled={busy} aria-invalid={!opacityValid} className="h-8 px-2 text-xs" onChange={event => {
            const value = event.target.value, number = value.trim() ? Number(value) : NaN
            setOpacityDraft(value)
            if (Number.isFinite(number) && number >= 0 && number <= 100) useEditor.getState().setFillOpacity(number / 100)
          }} onBlur={() => { if (!opacityValid) setOpacityDraft(percentage(useEditor.getState().fillOpacity)) }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }} />
          <span aria-hidden="true" className="text-[11px] text-muted-foreground">%</span>
        </div>
      </div>
    </div>
    {loading && <p role="status" className="mt-2 text-[11px] text-muted-foreground">正在识别分割区域…</p>}
    {error && <p role="alert" className="mt-2 text-[11px] leading-relaxed text-destructive">{error}</p>}
  </section>
}
