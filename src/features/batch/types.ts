import type { TemplateRecord } from '@/lib/db'

export type BatchFit = 'relative' | 'original'
export type BatchItem = {
  id: string
  file: File
  url: string
  width: number
  height: number
  offsetX: number
  offsetY: number
  status: 'ready' | 'working' | 'done' | 'error'
  error?: string
  count?: number
}
export type BatchTemplate = Pick<TemplateRecord, 'id' | 'name' | 'layout'>
export type BatchUpdate = Pick<BatchItem, 'status' | 'error' | 'count'>
