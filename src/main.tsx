import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Editor } from '@/features/editor/components/Editor'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delayDuration={350}>
      <Editor />
      <Toaster position="bottom-center" richColors />
    </TooltipProvider>
  </StrictMode>,
)
