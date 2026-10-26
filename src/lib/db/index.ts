import Dexie, { type EntityTable } from 'dexie'
import type { DocumentData } from '@/features/editor/model/types'
import { getImageAsset } from '@/lib/images'
import { validateDocument } from '@/features/templates/validation'
import { segments } from '@/features/editor/geometry'

export type TemplateRecord = { id: string; name: string; imageId: string; doc: DocumentData; thumbnail: Blob; updatedAt: number }
const db = new Dexie('LineNest') as Dexie & {
  templates: EntityTable<TemplateRecord, 'id'>
  images: EntityTable<{ id: string; blob: Blob }, 'id'>
}
db.version(1).stores({ templates: 'id, imageId, updatedAt', images: 'id' })

async function thumbnailFor(doc: DocumentData): Promise<Blob> {
  const asset = getImageAsset(doc.image?.id)
  if (!asset) throw new Error('找不到原图，请重新导入')
  const canvas = document.createElement('canvas'), scale = Math.min(240 / asset.element.naturalWidth, 150 / asset.element.naturalHeight, 1)
  canvas.width = Math.max(1, Math.round(asset.element.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(asset.element.naturalHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('无法生成预览')
  context.drawImage(asset.element, 0, 0, canvas.width, canvas.height)
  context.save()
  context.scale(canvas.width / asset.element.naturalWidth, canvas.height / asset.element.naturalHeight)
  context.strokeStyle = '#237a60'; context.lineWidth = 1.5 / scale
  for (const line of segments(doc)) {
    context.beginPath(); context.moveTo(line.start.x, line.start.y); context.lineTo(line.end.x, line.end.y); context.stroke()
  }
  if (doc.crop) {
    context.setLineDash([4 / scale, 3 / scale])
    context.strokeRect(doc.crop.x, doc.crop.y, doc.crop.width, doc.crop.height)
  }
  context.restore()
  return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('无法生成预览')), 'image/png'))
}

export const listTemplates = () => db.templates.orderBy('updatedAt').reverse().toArray()
export async function saveTemplate(name: string, source: DocumentData) {
  const doc = validateDocument(source), image = doc.image!, asset = getImageAsset(image.id)
  if (!asset) throw new Error('找不到原图，请重新导入')
  if (!name.trim()) throw new Error('请输入模板名称')
  const thumbnail = await thumbnailFor(doc)
  await db.transaction('rw', db.templates, db.images, async () => {
    await db.images.put({ id: image.id, blob: asset.blob })
    await db.templates.add({ id: crypto.randomUUID(), name: name.trim().slice(0, 80), imageId: image.id, doc, thumbnail, updatedAt: Date.now() })
  })
}
export async function readTemplate(id: string) {
  const row = await db.templates.get(id)
  if (!row) throw new Error('模板不存在')
  const image = await db.images.get(row.imageId)
  if (!image) throw new Error('模板原图已丢失')
  return { doc: validateDocument(row.doc), blob: image.blob }
}
export async function renameTemplate(id: string, name: string) {
  if (!name.trim()) throw new Error('请输入模板名称')
  const count = await db.templates.update(id, { name: name.trim().slice(0, 80), updatedAt: Date.now() })
  if (!count) throw new Error('模板不存在')
}
export async function deleteTemplate(id: string) {
  await db.transaction('rw', db.templates, db.images, async () => {
    const row = await db.templates.get(id)
    if (!row) return
    await db.templates.delete(id)
    if (await db.templates.where('imageId').equals(row.imageId).count() === 0) await db.images.delete(row.imageId)
  })
}
