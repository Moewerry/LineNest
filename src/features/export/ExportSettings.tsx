import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { imageFormats, formatLabel, exportFileName, resolveFormat, supportsFormat, type ExportOptions, type ImageFormat } from '@/lib/export/options'

export function ExportSettings({ sources, value, onChange, disabled, onReady, columns = false }: { sources: string[]; value: ExportOptions; onChange: (value: ExportOptions) => void; disabled: boolean; onReady: (ready: boolean) => void; columns?: boolean }) {
  const id = useId()
  const [supported, setSupported] = useState<ImageFormat[] | null>(null)
  useEffect(() => {
    let active = true
    void Promise.all(imageFormats.map(async format => await supportsFormat(format) ? format : null)).then(formats => { if (active) setSupported(formats.filter((format): format is ImageFormat => format !== null)) }).catch(() => { if (active) setSupported([]) })
    return () => { active = false }
  }, [])
  const unsupported = supported && sources.some(source => !supported.includes(resolveFormat(value, source)))
  const ready = supported !== null && !unsupported && (value.naming !== 'custom' || !!value.prefix.trim())
  useEffect(() => { onReady(ready) }, [ready, onReady])
  return <section className={columns ? 'grid min-w-0 gap-6 md:grid-cols-2' : 'space-y-4'} aria-label="导出设置">
    <div className="min-w-0 space-y-2"><h3 className="text-sm font-semibold">图片格式</h3>
      <div role="group" aria-label="图片格式" className="flex flex-wrap gap-2">
        {(['original', ...imageFormats] as const).map(format => <Button key={format} size="sm" variant={value.format === format ? 'default' : 'outline'} aria-pressed={value.format === format} disabled={disabled || (format !== 'original' && (!supported || !supported.includes(format)))} onClick={() => onChange({ ...value, format })}>{format === 'original' ? '沿用原图' : formatLabel(format)}</Button>)}
      </div>
      {unsupported && <p role="alert" className="text-xs text-destructive">当前浏览器不支持部分原图格式的导出，请选择其他格式。</p>}
      <p className="text-xs text-muted-foreground">默认沿用每张原图的格式。JPG 不支持透明，空白区域填充白色；其他格式保留透明区域。</p>
    </div>
    <div className={columns ? 'min-w-0 space-y-2 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6' : 'min-w-0 space-y-2'}><h3 className="text-sm font-semibold">文件命名</h3>
      <div role="group" aria-label="文件命名" className="flex flex-wrap gap-2">
        {([{ id: 'website', label: '网站名 + 时间' }, { id: 'original', label: '原文件名' }, { id: 'custom', label: '自定义名称' }] as const).map(option => <Button key={option.id} size="sm" variant={value.naming === option.id ? 'default' : 'outline'} aria-pressed={value.naming === option.id} disabled={disabled} onClick={() => onChange({ ...value, naming: option.id })}>{option.label}</Button>)}
      </div>
      {value.naming === 'custom' && <><label htmlFor={id} className="text-xs text-muted-foreground">文件名前缀</label><Input id={id} value={value.prefix} maxLength={64} disabled={disabled} placeholder="输入名称，自动添加序号" onChange={event => onChange({ ...value, prefix: event.target.value })} /></>}
      <p className="break-all rounded-lg bg-muted p-3 text-xs" aria-live="polite">示例：{exportFileName(value, sources[0] ?? 'image.png', 1)}<br /><span className="text-muted-foreground">按本次导出顺序追加 -1、-2、-3…；过长名称会截短。</span></p>
    </div>
  </section>
}
