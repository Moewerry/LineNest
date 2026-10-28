import { readWorkspaceDraft, saveWorkspaceDraft } from '@/lib/db'
import { discardImageAsset, getImageAsset, registerImage } from '@/lib/images'
import { toast } from '@/lib/toast'
import { useEditor } from './store'
import { emptySnapshot, type DocumentData } from './types'

let initialization: Promise<void> | undefined
let writes = Promise.resolve()
let saveFailed = false

function queueSave(doc: DocumentData) {
  const blob = getImageAsset(doc.image?.id)?.blob
  // Serialize writes so a slow save cannot replace a newer edit or a cleared draft.
  writes = writes.then(() => saveWorkspaceDraft(doc, blob)).then(() => {
    saveFailed = false
  }, () => {
    if (!saveFailed) toast.error('工作台自动保存失败，刷新后可能丢失当前内容，请检查浏览器存储空间或权限', { id: 'workspace-save-error' })
    saveFailed = true
  })
}

export const waitForWorkspaceSave = () => writes

async function initialize() {
  try {
    const draft = await readWorkspaceDraft()
    if (draft && !useEditor.getState().present.doc.image) {
      const savedImage = draft.doc.image!
      const image = await registerImage(draft.blob, savedImage.name, savedImage.id)
      if (image.width !== savedImage.width || image.height !== savedImage.height) {
        discardImageAsset(image.id)
        throw new Error('本地工作台图片尺寸不匹配')
      }
      useEditor.setState({ present: { ...emptySnapshot(), doc: { ...draft.doc, image } }, past: [], future: [], checkedObjects: [], heldTemplate: null })
    }
  } catch {
    toast.error('无法恢复上次工作台，请检查浏览器存储空间或权限后刷新重试', { id: 'workspace-restore-error' })
  }
  // Subscribe after restoring; the initial empty document must not erase the saved draft.
  useEditor.subscribe((state, previous) => {
    if (state.present.doc !== previous.present.doc) queueSave(state.present.doc)
  })
}

export function initializeWorkspaceSession() {
  return initialization ??= initialize()
}
