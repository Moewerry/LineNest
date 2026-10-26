import { downloadBlob } from '@/lib/download'
import { lineTemplateFromDocument, validateLineTemplate, type LineTemplate } from './layout'
import { validateDocument } from './validation'

export function exportTemplate(name: string, template: LineTemplate) {
  const contents = JSON.stringify({ format: 'linenest', version: 2, layout: validateLineTemplate(template) })
  downloadBlob(new Blob([contents], { type: 'application/json' }), `${name.replace(/[<>:"/\\|?*]/g, '-')}.linenest.json`)
}
export async function importTemplate(file: File): Promise<LineTemplate> {
  if (file.size > 60 * 1024 * 1024) throw new Error('模板文件超过 60 MB')
  const value = JSON.parse(await file.text())
  if (!value || value.format !== 'linenest') throw new Error('请选择 LineNest 模板文件')
  if (value.version === 2) return validateLineTemplate(value.layout)
  // Legacy backups are accepted only for their lines; embedded images are ignored.
  if (value.version === 1) return lineTemplateFromDocument(validateDocument(value.document))
  throw new Error('模板格式无效或版本不受支持')
}
