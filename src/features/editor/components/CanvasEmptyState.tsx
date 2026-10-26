import { Button } from '@/components/ui/button'

export function CanvasEmptyState({ onPick, busy }: { onPick: () => void; busy: boolean }) {
  return <div className="absolute inset-0 flex items-center justify-center">
    <Button variant="outline" disabled={busy} onClick={onPick} className="h-24 w-52 border-dashed bg-background text-muted-foreground shadow-none">{busy ? '正在读取图片…' : '请上传图片'}</Button>
  </div>
}
