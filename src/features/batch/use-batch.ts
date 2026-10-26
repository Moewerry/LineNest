import { useEffect, useRef, useState } from 'react'
import { liveQuery } from 'dexie'
import { toast } from 'sonner'
import { listTemplates } from '@/lib/db'
import { validateImage } from '@/lib/images'
import { importTemplate } from '@/features/templates/portable'
import { validateLineTemplate } from '@/features/templates/layout'
import { exportBatch } from './export'
import type { Point } from '@/features/editor/model/types'
import type { BatchFit, BatchItem, BatchTemplate } from './types'
import type { ExportOptions } from '@/lib/export/options'

const message = (error: unknown) => error instanceof Error ? error.message : '操作失败'

export function useBatch(initialTemplate: string | null) {
  const [items, setItems] = useState<BatchItem[]>([])
  const [templates, setTemplates] = useState<BatchTemplate[]>([])
  const [selected, setSelected] = useState<string[]>(initialTemplate ? [initialTemplate] : [])
  const [loading, setLoading] = useState(true), [templateError, setTemplateError] = useState('')
  const [fit, setFit] = useState<BatchFit>('relative')
  const [importing, setImporting] = useState(false), [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ blob: Blob; total: number } | null>(null)
  const urls = useRef(new Set<string>()), mounted = useRef(true)
  const operation = useRef(false), abort = useRef<AbortController | null>(null)
  const initialized = useRef(false)
  const initialSelection = useRef(initialTemplate)
  useEffect(() => {
    mounted.current = true
    const subscription = liveQuery(listTemplates).subscribe({
      next: rows => {
        try {
          const valid = rows.map(row => ({ ...row, layout: validateLineTemplate(row.layout) }))
          setTemplates(previous => [...valid, ...previous.filter(row => row.id.startsWith('import-'))])
          if (!initialized.current) { initialized.current = true; if (!initialSelection.current && valid[0]) setSelected([valid[0].id]) }
          setTemplateError('')
        } catch (value) { setTemplateError(message(value)) }
        setLoading(false)
      },
      error: value => { setTemplateError(message(value)); setLoading(false) },
    })
    const resources = urls.current
    return () => {
      mounted.current = false; subscription.unsubscribe(); abort.current?.abort()
      resources.forEach(url => URL.revokeObjectURL(url)); resources.clear()
    }
  }, [])

  const invalidate = () => { setResult(null); setError(''); setItems(rows => rows.map(row => ({ ...row, status: 'ready', error: undefined, count: undefined }))) }
  const addFiles = async (files: File[]) => {
    if (operation.current || !files.length) return
    operation.current = true; setImporting(true); invalidate()
    const added: BatchItem[] = [], failures: string[] = []
    let size = items.reduce((sum, item) => sum + item.file.size, 0)
    try {
      for (const file of files) {
        if (!mounted.current) break
        if (items.length + added.length >= 100) { failures.push('一次最多添加 100 张图片'); break }
        let url: string | undefined
        try {
          validateImage(file)
          if (size + file.size > 400 * 1024 * 1024) throw new Error('图片总大小不能超过 400 MB')
          url = URL.createObjectURL(file); urls.current.add(url)
          const image = new Image(); image.src = url
          let timeout: ReturnType<typeof setTimeout> | undefined
          try { await Promise.race([image.decode().catch(() => { throw new Error('图片已损坏或格式不支持') }), new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('图片读取超时')), 15000) })]) }
          finally { clearTimeout(timeout) }
          if (!mounted.current) { URL.revokeObjectURL(url); urls.current.delete(url); break }
          if (!image.naturalWidth || !image.naturalHeight) throw new Error('图片尺寸无效')
          if (image.naturalWidth * image.naturalHeight > 40_000_000 || image.naturalWidth > 16384 || image.naturalHeight > 16384) throw new Error('图片尺寸过大，请缩小后重试')
          added.push({ id: crypto.randomUUID(), file, url, width: image.naturalWidth, height: image.naturalHeight, offsetX: 0, offsetY: 0, status: 'ready' })
          size += file.size
        } catch (value) {
          if (url) { URL.revokeObjectURL(url); urls.current.delete(url) }
          failures.push(`${file.name}：${message(value)}`)
        }
      }
      if (mounted.current) {
        setItems(rows => [...rows, ...added])
        if (failures.length) { setError(failures.join('\n')); toast.error(`${failures.length} 项未添加`) }
      }
    } finally { operation.current = false; if (mounted.current) setImporting(false) }
  }
  const addTemplate = async (file: File) => {
    if (operation.current) return
    operation.current = true; setImporting(true)
    try {
      const layout = await importTemplate(file)
      if (!mounted.current) return
      const id = `import-${crypto.randomUUID()}`
      invalidate()
      setTemplates(rows => [...rows, { id, name: file.name.replace(/\.json$/i, ''), layout }])
      setSelected(ids => [...ids, id])
    } catch (value) { if (mounted.current) setError(message(value)) }
    finally { operation.current = false; if (mounted.current) setImporting(false) }
  }
  const remove = (id: string) => {
    if (operation.current) return
    const item = items.find(row => row.id === id)
    if (item) { URL.revokeObjectURL(item.url); urls.current.delete(item.url) }
    invalidate(); setItems(rows => rows.filter(row => row.id !== id))
  }
  const clear = () => {
    if (operation.current) return
    urls.current.forEach(url => URL.revokeObjectURL(url)); urls.current.clear()
    setItems([]); setResult(null); setError('')
  }
  const updateOffset = (id: string, templateId: string, axis: 'offsetX' | 'offsetY', value: number) => {
    if (operation.current || !selected.includes(templateId) || !Number.isFinite(value)) return
    invalidate()
    setItems(rows => rows.map(row => row.id === id ? { ...row, templateOffsets: { ...row.templateOffsets, [templateId]: { ...(row.templateOffsets?.[templateId] ?? { x: 0, y: 0 }), [axis === 'offsetX' ? 'x' : 'y']: Math.round(Math.max(-16384, Math.min(16384, value))) } } } : row))
  }
  const changeFit = (value: BatchFit) => { if (!operation.current) { invalidate(); setFit(value) } }
  const updateLineOffset = (id: string, lineId: string, offset: Point) => {
    if (operation.current || !Number.isFinite(offset.x) || !Number.isFinite(offset.y)) return
    const item = items.find(row => row.id === id)
    const chosen = templates.filter(template => selected.includes(template.id))
    if (!item || !chosen.some(template => Object.keys(template.layout.nodes).some(nodeId => JSON.stringify([template.id, nodeId]) === lineId && template.layout.nodes[nodeId].type === 'line'))) return
    invalidate()
    const limit = (value: number) => Math.round(Math.max(-16384, Math.min(16384, value)))
    setItems(rows => rows.map(row => row.id === id ? { ...row, lineOffsets: { ...row.lineOffsets, [lineId]: { x: limit(offset.x), y: limit(offset.y) } } } : row))
  }
  const resetPosition = (id: string, templateId: string) => {
    if (operation.current || !selected.includes(templateId)) return
    invalidate()
    const template = templates.find(row => row.id === templateId)
    const lineIds = new Set(Object.keys(template?.layout.nodes ?? {}).map(nodeId => JSON.stringify([templateId, nodeId])))
    setItems(rows => rows.map(row => row.id === id ? { ...row, templateOffsets: { ...row.templateOffsets, [templateId]: { x: 0, y: 0 } }, lineOffsets: Object.fromEntries(Object.entries(row.lineOffsets ?? {}).filter(([lineId]) => !lineIds.has(lineId))) } : row))
  }
  const editPreview = () => { if (!operation.current) invalidate() }
  const toggleTemplate = (id: string) => { if (!operation.current) { invalidate(); setSelected(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]) } }
  const start = async (options?: ExportOptions) => {
    if (operation.current) return
    const chosen = templates.filter(template => selected.includes(template.id))
    if (!items.length || !chosen.length) return
    operation.current = true; setRunning(true); invalidate()
    const controller = new AbortController(); abort.current = controller
    try {
      const output = await exportBatch(items, chosen, fit, controller.signal, (id, update) => {
        if (mounted.current && !controller.signal.aborted) setItems(rows => rows.map(row => row.id === id ? { ...row, ...update } : row))
      }, options)
      if (mounted.current && !controller.signal.aborted) setResult(output)
      if (mounted.current && !controller.signal.aborted) return output
    } catch (value) {
      if (mounted.current) {
        setError(controller.signal.aborted ? '已取消，可重新裁剪' : message(value))
        setItems(rows => rows.map(row => ({ ...row, status: !controller.signal.aborted && row.status === 'error' ? 'error' : 'ready', count: undefined, error: controller.signal.aborted ? undefined : row.error })))
      }
      if (options) throw value
    } finally { operation.current = false; if (mounted.current) setRunning(false) }
  }
  return { items, templates, selected, loading, templateError, fit, importing, running, error, result,
    addFiles, addTemplate, remove, clear, updateOffset, updateLineOffset, resetPosition, editPreview, changeFit, toggleTemplate, start, cancel: () => abort.current?.abort() }
}
