import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '@/features/home/components/HomePage'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { WorkspaceSession } from './WorkspaceSession'

const Editor = lazy(() => import('@/features/editor/components/Editor').then(module => ({ default: module.Editor })))
const BatchPage = lazy(() => import('@/features/batch/BatchPage').then(module => ({ default: module.BatchPage })))

export function App() {
  return <HashRouter><WorkspaceSession><Suspense fallback={<LoadingOverlay />}><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/editor" element={<Editor />} />
    <Route path="/batch" element={<BatchPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></WorkspaceSession></HashRouter>
}
