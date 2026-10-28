import type { ImageInfo } from '@/features/editor/model/types'
type ImageAsset = { blob: Blob; element: HTMLImageElement; url: string; sourceId: string }
const assets = new Map<string, ImageAsset>()
export const getImageAsset = (id?: string) => id ? assets.get(id) : undefined
export function isSameImageSource(firstId?: string, secondId?: string) {
  if (!firstId || !secondId) return false
  if (firstId === secondId) return true
  const sourceId = assets.get(firstId)?.sourceId
  return sourceId !== undefined && sourceId === assets.get(secondId)?.sourceId
}
export async function registerImage(blob: Blob, name: string, id: string = crypto.randomUUID()): Promise<ImageInfo> {
  const existing = assets.get(id)
  if (existing) return { id, name, width: existing.element.naturalWidth, height: existing.element.naturalHeight }
  const url = URL.createObjectURL(blob), element = new Image()
  element.src = url
  try {
    await element.decode()
    if (!element.naturalWidth || !element.naturalHeight) throw new Error('图片尺寸无效')
    assets.set(id, { blob, element, url, sourceId: id })
    return { id, name, width: element.naturalWidth, height: element.naturalHeight }
  } catch {
    URL.revokeObjectURL(url)
    throw new Error('无法读取图片，请选择 PNG、JPG、WebP 或 AVIF 文件')
  }
}
export async function rotateImageClockwise(image: ImageInfo): Promise<ImageInfo> {
  const asset = getImageAsset(image.id)
  if (!asset) throw new Error('找不到图片，请重新导入')
  const canvas = document.createElement('canvas')
  canvas.width = image.height; canvas.height = image.width
  try {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('浏览器无法创建旋转画布')
    context.imageSmoothingEnabled = false
    context.setTransform(0, 1, -1, 0, image.height, 0)
    context.drawImage(asset.element, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('旋转失败，图片可能过大')), 'image/png'))
    const rotated = await registerImage(blob, image.name)
    assets.get(rotated.id)!.sourceId = asset.sourceId
    return rotated
  } finally {
    canvas.width = 1; canvas.height = 1
  }
}

export function discardImageAsset(id: string) {
  const asset = assets.get(id)
  if (!asset) return
  URL.revokeObjectURL(asset.url)
  assets.delete(id)
}

export function validateImage(file: File) {
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/avif'].includes(file.type)) throw new Error('请选择 PNG、JPG、WebP 或 AVIF 图片')
  if (file.size > 40 * 1024 * 1024) throw new Error('请选择小于 40 MB 的图片')
}
// Keep assets referenced by undo history alive; release URLs when leaving the page.
window.addEventListener('pagehide', event => {
  if (!event.persisted) assets.forEach(asset => URL.revokeObjectURL(asset.url))
})
