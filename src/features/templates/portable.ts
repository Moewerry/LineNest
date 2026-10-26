import type { DocumentData } from '@/features/editor/model/types'
import { downloadBlob } from '@/lib/download'
import { validateDocument } from './validation'

export type PreparedTemplate = { doc: DocumentData; blob: Blob }
export async function exportTemplate(name: string, doc: DocumentData, blob: Blob) {
  const imageData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('读取原图失败'))
    reader.readAsDataURL(blob)
  })
  const contents = JSON.stringify({ format: 'linenest', version: 1, document: doc, imageData })
  downloadBlob(new Blob([contents], { type: 'application/json' }), `${name.replace(/[<>:"/\\|?*]/g, '-')}.linenest.json`)
}
export async function importTemplate(file: File): Promise<PreparedTemplate> {
  if (file.size > 60 * 1024 * 1024) throw new Error('模板文件超过 60 MB')
  const value = JSON.parse(await file.text())
  if (!value || value.format !== 'linenest' || value.version !== 1 || typeof value.imageData !== 'string') throw new Error('请选择 LineNest 模板文件')
  const doc = validateDocument(value.document)
  const match = /^data:(image\/(?:png|jpeg|webp|avif));base64,([A-Za-z0-9+/=]+)$/.exec(value.imageData)
  if (!match) throw new Error('模板图片格式无效')
  const bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0))
  return { doc, blob: new Blob([bytes], { type: match[1] }) }
}
