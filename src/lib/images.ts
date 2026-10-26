import type { ImageInfo } from '@/features/editor/model/types'
type ImageAsset = { blob: Blob; element: HTMLImageElement; url: string }
const assets = new Map<string, ImageAsset>()
export const getImageAsset = (id?: string) => id ? assets.get(id) : undefined
export async function registerImage(blob: Blob, name: string, id = crypto.randomUUID()): Promise<ImageInfo> {
  const existing = assets.get(id)
  if (existing) return { id, name, width: existing.element.naturalWidth, height: existing.element.naturalHeight }
  const url = URL.createObjectURL(blob), element = new Image()
  element.src = url
  try {
    await element.decode()
    if (!element.naturalWidth || !element.naturalHeight) throw new Error('图片尺寸无效')
    assets.set(id, { blob, element, url })
    return { id, name, width: element.naturalWidth, height: element.naturalHeight }
  } catch {
    URL.revokeObjectURL(url)
    throw new Error('无法读取图片，请选择 PNG、JPG、WebP 或 AVIF 文件')
  }
}
export function validateImage(file: File) {
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/avif'].includes(file.type)) throw new Error('请选择 PNG、JPG、WebP 或 AVIF 图片')
  if (file.size > 40 * 1024 * 1024) throw new Error('请选择小于 40 MB 的图片')
}
// Keep assets referenced by undo history alive; release URLs when leaving the page.
window.addEventListener('pagehide', event => {
  if (!event.persisted) assets.forEach(asset => URL.revokeObjectURL(asset.url))
})
