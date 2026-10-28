import type { ReactNode } from 'react'

export function CanvasWorkspace({ children }: { children: ReactNode }) {
  return <section aria-label="图片工作区" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card">
    {children}
  </section>
}
