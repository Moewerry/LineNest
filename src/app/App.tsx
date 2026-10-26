import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '@/features/home/components/HomePage'

const Editor = lazy(() => import('@/features/editor/components/Editor').then(module => ({ default: module.Editor })))

export function App() {
  return <BrowserRouter><Suspense fallback={<div role="status" className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">正在打开编辑器…</div>}><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/editor" element={<Editor />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></BrowserRouter>
}
