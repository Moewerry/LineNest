import { Zip, ZipPassThrough } from 'fflate'
import { discardImageAsset, getImageAsset, registerImage } from '@/lib/images'
import { calculateSlices } from '@/features/slicing/calculate'
import { regionPath } from '@/features/slicing/export'
import { batchDocument } from './document'
import type { BatchFit, BatchItem, BatchTemplate, BatchUpdate } from './types'

const safeName = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/^\.+$/, '_').slice(0, 80) || 'image'
const maxBytes = 256 * 1024 * 1024

export async function exportBatch(items: BatchItem[], templates: BatchTemplate[], fit: BatchFit, signal: AbortSignal, onUpdate: (id: string, update: BatchUpdate) => void) {
  if (!items.length || !templates.length) throw new Error('请添加图片并选择模板')
  const chunks: Uint8Array<ArrayBuffer>[] = []
  let bytes = 0, zipError: Error | null = null, total = 0
  const report: { source: string; template: string; count: number; error?: string }[] = []
  const zip = new Zip((error, data) => {
    if (error) zipError = error
    else if (data.length) { bytes += data.length; chunks.push(new Uint8Array(data)) }
  })
  const check = () => {
    signal.throwIfAborted()
    if (zipError) throw zipError
    if (bytes > maxBytes) throw new Error('结果超过 256 MB，请减少图片后重试')
  }
  const add = (name: string, data: Uint8Array) => {
    check()
    if (bytes + data.length > maxBytes) throw new Error('结果超过 256 MB，请减少图片后重试')
    const entry = new ZipPassThrough(name)
    zip.add(entry); entry.push(data, true); check()
  }
  const canvas = document.createElement('canvas')
  try {
    for (const [index, item] of items.entries()) {
      check(); onUpdate(item.id, { status: 'working' })
      let count = 0
      const errors: string[] = []
      try {
        if (item.width * item.height > 40_000_000 || item.width > 16384 || item.height > 16384) throw new Error('图片尺寸过大，请缩小后重试')
        await registerImage(item.file, item.file.name, item.id)
        check()
        const asset = getImageAsset(item.id)
        if (!asset) throw new Error('无法读取图片')
        for (const [templateIndex, template] of templates.entries()) {
          check()
          let templateCount = 0
          try {
            const doc = batchDocument(item, template, fit)
            const result = await calculateSlices(doc, signal)
            if (result.regions.length < 2) throw new Error('模板未分出多个区域，请检查尺寸和位置')
            if (result.unusedEdges > 0) throw new Error('部分线条未围成区域，请调整位置后重试')
            for (const region of result.regions) {
              check()
              const { x, y, width, height } = region.box
              if (width * height > 40_000_000 || width > 16384 || height > 16384) throw new Error('裁剪区域过大')
              canvas.width = width; canvas.height = height
              const context = canvas.getContext('2d')
              if (!context) throw new Error('无法创建裁剪画布')
              context.translate(-x, -y); context.clip(regionPath(region), 'evenodd')
              context.drawImage(asset.element, 0, 0)
              const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('图片导出失败')), 'image/png'))
              check()
              add(`${index + 1}_${safeName(item.file.name)}/${templateIndex + 1}_${safeName(template.name)}/slice-${String(region.id).padStart(3, '0')}.png`, new Uint8Array(await blob.arrayBuffer()))
              count++; templateCount++; total++
              await new Promise<void>(resolve => window.setTimeout(resolve, 0))
            }
            report.push({ source: item.file.name, template: template.name, count: templateCount })
          } catch (error) {
            check()
            const message = error instanceof Error ? error.message : '裁剪失败'
            errors.push(`${template.name}：${message}`)
            report.push({ source: item.file.name, template: template.name, count: templateCount, error: message })
          }
        }
      } catch (error) {
        check()
        const message = error instanceof Error ? error.message : '图片读取失败'
        errors.push(message)
        report.push({ source: item.file.name, template: '', count, error: message })
      } finally { discardImageAsset(item.id) }
      onUpdate(item.id, { status: errors.length ? 'error' : 'done', count, error: errors.join('；') || undefined })
    }
    check()
    if (!total) throw new Error('没有生成图片，请检查失败原因')
    add('处理结果.json', new TextEncoder().encode(JSON.stringify({ fit, total, report }, null, 2)))
    zip.end(); check()
    return { blob: new Blob(chunks, { type: 'application/zip' }), total }
  } finally { zip.terminate(); canvas.width = 1; canvas.height = 1 }
}
