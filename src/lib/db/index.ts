import Dexie, { type EntityTable } from 'dexie'
import type { DocumentData } from '@/features/editor/model/types'
import { lineTemplateFromDocument, validateLineTemplate, type LineTemplate } from '@/features/templates/layout'
import { selectedTemplateDocument } from '@/features/templates/selected-document'

export type TemplateRecord = { id: string; name: string; layout: LineTemplate; updatedAt: number }
type WorkspaceDraftRecord = { id: 'current'; doc: DocumentData }
type WorkspaceImageRecord = { id: string; blob: Blob }
const db = new Dexie('LineNest') as Dexie & {
  templates: EntityTable<TemplateRecord, 'id'>
  workspaceDrafts: EntityTable<WorkspaceDraftRecord, 'id'>
  workspaceImages: EntityTable<WorkspaceImageRecord, 'id'>
}
db.version(1).stores({ templates: 'id, imageId, updatedAt', images: 'id' })
// Rewrite old records without original images, image thumbnails or crop.
// Removing the images store releases the previously persisted originals as well.
db.version(2).stores({ templates: 'id, updatedAt', images: null }).upgrade(async transaction => {
  const table = transaction.table('templates')
  const rows = await table.toArray() as { id: string; name: string; doc: DocumentData; updatedAt: number }[]
  await table.bulkPut(rows.map(row => ({ id: row.id, name: row.name, layout: lineTemplateFromDocument(row.doc), updatedAt: row.updatedAt })))
})
db.version(3).stores({ workspaceDrafts: 'id', workspaceImages: 'id' })

export async function readWorkspaceDraft() {
  return db.transaction('r', db.workspaceDrafts, db.workspaceImages, async () => {
    const draft = await db.workspaceDrafts.get('current')
    if (!draft) return null
    if (draft.doc.version !== 1 || !draft.doc.image) throw new Error('本地工作台数据无效')
    const image = await db.workspaceImages.get(draft.doc.image.id)
    if (!image) throw new Error('本地工作台图片缺失')
    return { doc: draft.doc, blob: image.blob }
  })
}

export async function saveWorkspaceDraft(doc: DocumentData, blob?: Blob) {
  await db.transaction('rw', db.workspaceDrafts, db.workspaceImages, async () => {
    const image = doc.image
    if (!image) {
      await db.workspaceDrafts.delete('current')
      await db.workspaceImages.clear()
      return
    }
    if (!blob) throw new Error('找不到工作台图片，无法自动保存')
    // Keep the image binary separate so editing geometry only writes the document.
    if (!await db.workspaceImages.where('id').equals(image.id).count()) {
      await db.workspaceImages.put({ id: image.id, blob })
    }
    await db.workspaceDrafts.put({ id: 'current', doc })
    await db.workspaceImages.where('id').notEqual(image.id).delete()
  })
}

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
