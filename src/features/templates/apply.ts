import { useEditor } from '@/features/editor/model/store'
import type { ImageInfo } from '@/features/editor/model/types'
import { validateLineTemplate, type LineTemplate } from './layout'
import { normalizeSplitLines } from '@/features/editor/geometry'

export const sameSize = (a: { width: number; height: number }, b: { width: number; height: number }) => a.width === b.width && a.height === b.height

export function applyTemplate(template: LineTemplate, expectedImage: ImageInfo) {
  const state = useEditor.getState(), image = state.present.doc.image
  if (!image) throw new Error('请先导入图片，再套用线条模板')
  if (image.id !== expectedImage.id || !sameSize(image, expectedImage)) throw new Error('当前图片已变化，请重新套用模板')
  const layout = validateLineTemplate(template)
  state.commit(snapshot => {
    snapshot.doc.nodes = layout.nodes
    snapshot.doc.roots = layout.roots
    normalizeSplitLines(snapshot.doc)
    snapshot.selected = []
    snapshot.scope = null
  })
  state.setTool('select')
}
