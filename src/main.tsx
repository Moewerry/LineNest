import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { App } from '@/app/App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delayDuration={350}>
      <App />
      <Toaster position="bottom-center" richColors />
    </TooltipProvider>
  </StrictMode>,
)
