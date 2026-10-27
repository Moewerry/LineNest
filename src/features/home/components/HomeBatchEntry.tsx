import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { listTemplates } from '@/lib/db'
import { HomeNoTemplatesOverlay } from './HomeNoTemplatesOverlay'
import { builtinTemplates } from '@/features/templates/builtins'

const BatchEntryContext = createContext<{ openBatch: () => void; checking: boolean } | null>(null)

export function useHomeBatchEntry() {
  const context = useContext(BatchEntryContext)
  if (!context) throw new Error('批量裁剪入口必须位于 HomeBatchEntry 内')
  return context
}

export function HomeBatchEntry({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const checkingRef = useRef(false)
  const [checking, setChecking] = useState(false)
  const [open, setOpen] = useState(false)

  const openBatch = async () => {
    if (builtinTemplates.length) { navigate('/batch'); return }
    if (checkingRef.current) return
    checkingRef.current = true
    setChecking(true)
    try {
      const templates = await listTemplates()
      if (templates.length) navigate('/batch')
      else setOpen(true)
    } catch {
      toast.error('模板读取失败，请重试')
    } finally {
      checkingRef.current = false
      setChecking(false)
    }
  }

  return <BatchEntryContext.Provider value={{ openBatch: () => void openBatch(), checking }}>
    {children}
    <HomeNoTemplatesOverlay open={open} onOpenChange={setOpen} onEnter={() => { setOpen(false); navigate('/editor') }} />
  </BatchEntryContext.Provider>
}
