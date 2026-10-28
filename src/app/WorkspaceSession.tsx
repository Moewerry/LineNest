import { useEffect, useState, type ReactNode } from 'react'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { initializeWorkspaceSession } from '@/features/editor/model/workspace-session'

export function WorkspaceSession({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let active = true
    void initializeWorkspaceSession().then(() => { if (active) setReady(true) })
    return () => { active = false }
  }, [])

  return ready ? children : <LoadingOverlay title="正在读取工作台" description="正在恢复上次的图片和编辑内容。" />
}
