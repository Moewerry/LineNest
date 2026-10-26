import type { TemplateRecord } from '@/lib/db'
import type { Point } from '@/features/editor/model/types'

export type BatchFit = 'relative' | 'original'
export type BatchItem = {
  id: string
  file: File
  url: string
  width: number
  height: number
  offsetX: number
  offsetY: number
  lineOffsets?: Record<string, Point>
  templateOffsets?: Record<string, Point>
  status: 'ready' | 'working' | 'done' | 'error'
  error?: string
  count?: number
}
export type BatchTemplate = Pick<TemplateRecord, 'id' | 'name' | 'layout'>
export type BatchUpdate = Pick<BatchItem, 'status' | 'error' | 'count'>
