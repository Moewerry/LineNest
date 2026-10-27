import { useEditor } from '@/features/editor/model/store'
import type { LineTemplate } from './layout'
import { findBuiltinTemplate } from './builtins'

export function pickUpBuiltinTemplate(id: string) {
  const template = findBuiltinTemplate(id)
  if (!template) throw new Error('内置模板不存在')
  useEditor.getState().pickUpTemplate(template.layout, template.name)
}

export function pickUpTemplate(template: LineTemplate, name = '线条模板') {
  useEditor.getState().pickUpTemplate(template, name)
}
