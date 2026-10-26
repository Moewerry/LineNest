import { segments } from '@/features/editor/geometry'
import { templateDocument, type LineTemplate } from './layout'

export function TemplateThumbnail({ layout }: { layout: LineTemplate }) {
  const lines = segments(templateDocument(layout))
  return <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-secondary p-1">
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label="线条模板预览" className="h-full w-full text-primary">
      {lines.map(line => <line key={line.id} x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />)}
    </svg>
  </div>
}
