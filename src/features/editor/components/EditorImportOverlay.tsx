import { LoaderCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyStateNavigation } from './EmptyStateNavigation'

export function EditorImportOverlay({ onPick, busy, dragging }: { onPick: () => void; busy: boolean; dragging: boolean }) {
  return <div className="fixed inset-0 z-20 flex h-dvh min-w-0 flex-col overflow-y-auto overscroll-contain bg-card pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-[calc(6rem+env(safe-area-inset-top))] sm:pb-[max(3rem,env(safe-area-inset-bottom))] sm:pl-[max(3rem,env(safe-area-inset-left))] sm:pr-[max(3rem,env(safe-area-inset-right))] sm:pt-[calc(6rem+env(safe-area-inset-top))]">
    <EmptyStateNavigation busy={busy} />
    <section aria-labelledby="image-import-heading" aria-busy={busy} className="mx-auto my-auto w-full max-w-4xl shrink-0">
      <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-16 md:gap-y-12 lg:gap-x-28 lg:gap-y-16">
        <h1 id="image-import-heading" className="min-w-0 break-words text-[clamp(1.75rem,3.8vw,3.5rem)] font-semibold leading-tight tracking-tight md:col-start-1 md:row-start-1">从一张图片开始</h1>
        <p role="status" className="min-w-0 break-words space-y-2 text-base leading-8 text-muted-foreground md:col-start-2 md:row-start-1 md:text-right">{busy ? '正在读取图片，请稍候…' : dragging ? '松开图片，开始分割。' : <><span className="block">将图片<span className="text-primary">拖拽</span>到这里，</span><span className="block">或选择图片<span className="text-primary">上传。</span></span></>}</p>
        <Button variant="default" size="lg" aria-label="上传图片" disabled={busy} onClick={onPick} className="group h-14 w-full min-w-0 gap-3 rounded-xl px-7 text-base font-semibold text-white shadow-sm hover:text-white has-[>svg]:px-7 md:col-start-2 md:row-start-2 md:w-auto md:min-w-48 md:justify-self-end md:self-end lg:h-16 lg:min-w-52">
          <span>{busy ? '正在读取图片' : '上传图片'}</span>
          {busy ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin motion-reduce:animate-none" /> : <Upload aria-hidden="true" className="size-5 transition-transform motion-reduce:transition-none motion-safe:group-hover:-translate-y-0.5" />}
        </Button>
        <p className="min-w-0 break-words text-sm leading-7 text-muted-foreground md:col-start-1 md:row-start-2 md:self-end md:text-base md:leading-8">支持 PNG、JPG、WebP、AVIF</p>
      </div>
    </section>
  </div>
}
