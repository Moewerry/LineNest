import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { listTemplates } from '@/lib/db'

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>暂无模板</DialogTitle>
          <DialogDescription>请进入工作台去创建模板。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={() => { setOpen(false); navigate('/editor') }}>进入工作台</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </BatchEntryContext.Provider>
}
