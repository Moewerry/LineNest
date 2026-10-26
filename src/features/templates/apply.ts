import { useEditor } from '@/features/editor/model/store'
import { registerImage } from '@/lib/images'
import type { ImageInfo } from '@/features/editor/model/types'
import type { PreparedTemplate } from './portable'
import { validateDocument } from './validation'
import { normalizeSplitLines } from '@/features/editor/geometry'

export const sameSize = (a: ImageInfo, b: ImageInfo) => a.width === b.width && a.height === b.height

export async function applyTemplate(template: PreparedTemplate, currentImage: ImageInfo | null) {
  const doc = validateDocument(template.doc)
  if (currentImage) {
    // Different sizes keep the exact line coordinates; clearing the crop is explicit in confirmation.
    if (!sameSize(doc.image!, currentImage)) doc.crop = null
    doc.image = currentImage
  } else {
    const image = await registerImage(template.blob, doc.image!.name)
    if (!sameSize(doc.image!, image)) throw new Error('模板图片尺寸与布局不一致')
    doc.image = image
  }
  normalizeSplitLines(doc)
  useEditor.getState().commit(s => { s.doc = doc; s.selected = []; s.scope = null })
  useEditor.getState().setTool('select')
}
