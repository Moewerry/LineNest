import Dexie, { type EntityTable } from 'dexie'
import type { DocumentData } from '@/features/editor/model/types'
import { lineTemplateFromDocument, validateLineTemplate, type LineTemplate } from '@/features/templates/layout'
import { selectedTemplateDocument } from '@/features/templates/selected-document'

export type TemplateRecord = { id: string; name: string; layout: LineTemplate; updatedAt: number }
const db = new Dexie('LineNest') as Dexie & {
  templates: EntityTable<TemplateRecord, 'id'>
}
db.version(1).stores({ templates: 'id, imageId, updatedAt', images: 'id' })
// Rewrite old records without original images, image thumbnails or crop.
// Removing the images store releases the previously persisted originals as well.
db.version(2).stores({ templates: 'id, updatedAt', images: null }).upgrade(async transaction => {
  const table = transaction.table('templates')
  const rows = await table.toArray() as { id: string; name: string; doc: DocumentData; updatedAt: number }[]
  await table.bulkPut(rows.map(row => ({ id: row.id, name: row.name, layout: lineTemplateFromDocument(row.doc), updatedAt: row.updatedAt })))
})

export const listTemplates = () => db.templates.orderBy('updatedAt').reverse().toArray()
export async function saveTemplate(name: string, source: DocumentData, checkedIds?: string[], checkedMarkIds?: string[]) {
  if (!name.trim()) throw new Error('请输入模板名称')
  const layout = lineTemplateFromDocument(checkedIds ? selectedTemplateDocument(source, checkedIds, checkedMarkIds) : source)
  if (!Object.values(layout.nodes).some(node => node.type === 'line') && !layout.marks?.length) throw new Error('请先绘制线条或添加标记块，再保存模板')
  await db.templates.add({ id: crypto.randomUUID(), name: name.trim().slice(0, 80), layout, updatedAt: Date.now() })
}
export async function readTemplate(id: string) {
  const row = await db.templates.get(id)
  if (!row) throw new Error('模板不存在')
  return validateLineTemplate(row.layout)
}
export async function renameTemplate(id: string, name: string) {
  if (!name.trim()) throw new Error('请输入模板名称')
  const count = await db.templates.update(id, { name: name.trim().slice(0, 80), updatedAt: Date.now() })
  if (!count) throw new Error('模板不存在')
}
export async function deleteTemplate(id: string) {
  await db.templates.delete(id)
}
