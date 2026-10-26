import { segments } from '@/features/editor/geometry'
import { templateDocument, type LineTemplate } from './layout'
import { cn } from '@/lib/utils'

export function TemplateThumbnail({ layout, className }: { layout: LineTemplate; className?: string }) {
  const lines = segments(templateDocument(layout))
  return <div className={cn('flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary/70 p-1', className)}>
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label="线条模板预览" className="h-full w-full text-primary">
      <rect x="0" y="0" width={layout.width} height={layout.height} fill="var(--background)" stroke="var(--border)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      {lines.map(line => <line key={line.id} x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />)}
    </svg>
  </div>
}
