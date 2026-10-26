import { Zip, ZipPassThrough } from 'fflate'
import { getImageAsset } from '@/lib/images'
import { downloadBlob } from '@/lib/download'
import type { DocumentData } from '@/features/editor/model/types'
import type { SliceRegion } from './types'

export function regionPath(region: SliceRegion): Path2D {
  const path = new Path2D()
  for (const ring of region.rings) {
    if (!ring.length) continue
    path.moveTo(ring[0].x, ring[0].y)
    ring.slice(1).forEach(point => path.lineTo(point.x, point.y))
    path.closePath()
  }
  return path
}

export async function exportSlices(doc: DocumentData, regions: SliceRegion[], signal: AbortSignal, onProgress: (count: number) => void) {
  const asset = getImageAsset(doc.image?.id)
  if (!asset || !doc.image) throw new Error('找不到原图，请重新导入')
  if (!regions.length) throw new Error('请选择需要导出的切片')
  const pixels = regions.reduce((sum, region) => sum + region.box.width * region.box.height, 0)
  if (pixels > 80_000_000) throw new Error('本次切片总尺寸过大，请减少勾选后分批导出')
  const chunks: Uint8Array<ArrayBuffer>[] = []
  let zipError: Error | null = null
  const zip = new Zip((error, data) => {
    if (error) zipError = error
    else if (data.length) chunks.push(new Uint8Array(data))
  })
  const check = () => { signal.throwIfAborted(); if (zipError) throw zipError }
  const canvas = document.createElement('canvas')
  try {
    for (let i = 0; i < regions.length; i++) {
      check()
      const region = regions[i], { x, y, width, height } = region.box
      canvas.width = width; canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('无法创建导出画布')
      context.translate(-x, -y)
      context.clip(regionPath(region), 'evenodd')
      context.drawImage(asset.element, 0, 0)
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('切片尺寸过大，导出失败')), 'image/png'))
      check()
      const file = new ZipPassThrough(`slice-${String(region.id).padStart(3, '0')}.png`)
      zip.add(file); file.push(new Uint8Array(await blob.arrayBuffer()), true)
      check(); onProgress(i + 1)
      await new Promise<void>(resolve => window.setTimeout(resolve, 0))
    }
    check()
    const manifest = new ZipPassThrough('slices.json')
    zip.add(manifest)
    manifest.push(new TextEncoder().encode(JSON.stringify({
      source: { name: doc.image.name, width: doc.image.width, height: doc.image.height },
      crop: doc.crop,
      slices: regions.map(region => ({ file: `slice-${String(region.id).padStart(3, '0')}.png`, ...region.box, rings: region.rings })),
    }, null, 2)), true)
    zip.end(); check()
    const base = doc.image.name.replace(/\.[^.]+$/, '')
    downloadBlob(new Blob(chunks, { type: 'application/zip' }), `${base}-slices.zip`)
  } finally {
    zip.terminate(); canvas.width = 1; canvas.height = 1
  }
}
