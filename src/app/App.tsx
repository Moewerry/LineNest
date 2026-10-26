import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '@/features/home/components/HomePage'

const Editor = lazy(() => import('@/features/editor/components/Editor').then(module => ({ default: module.Editor })))
const BatchPage = lazy(() => import('@/features/batch/BatchPage').then(module => ({ default: module.BatchPage })))

export function App() {
  return <HashRouter><Suspense fallback={<div role="status" className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">正在打开…</div>}><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/editor" element={<Editor />} />
    <Route path="/batch" element={<BatchPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></HashRouter>
}
