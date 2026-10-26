import type { DocumentData } from '@/features/editor/model/types'
import { getImageAsset } from '@/lib/images'
import { downloadBlob } from '@/lib/download'
import { encodeImage, exportFileName, resolveFormat, type ExportOptions } from './options'

export async function exportImage(doc: DocumentData, cropOnly: boolean, options: ExportOptions) {
  const image = doc.image, asset = getImageAsset(image?.id)
  if (!image || !asset) throw new Error('请先导入图片')
  if (cropOnly && !doc.crop) throw new Error('请先框选裁剪区域')
  const crop = cropOnly ? doc.crop! : { x: 0, y: 0, width: image.width, height: image.height }
  const x = Math.max(0, Math.floor(crop.x)), y = Math.max(0, Math.floor(crop.y))
  const width = Math.min(image.width, Math.ceil(crop.x + crop.width)) - x
  const height = Math.min(image.height, Math.ceil(crop.y + crop.height)) - y
  if (width < 1 || height < 1) throw new Error('裁剪选区无效')
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('浏览器无法创建导出画布')
  ctx.drawImage(asset.element, x, y, width, height, 0, 0, width, height)
  try {
    const blob = await encodeImage(canvas, resolveFormat(options, image.name))
    downloadBlob(blob, exportFileName(options, image.name, 1))
  } finally { canvas.width = 1; canvas.height = 1 }
}
