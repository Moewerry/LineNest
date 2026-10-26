export const imageFormats = ['png', 'jpeg', 'webp', 'avif'] as const
export type ImageFormat = typeof imageFormats[number]
export type ExportOptions = { format: ImageFormat | 'original'; naming: 'website' | 'original' | 'custom'; prefix: string; timestamp: string }
export const formatLabel = (format: ImageFormat) => format === 'jpeg' ? 'JPG' : format.toUpperCase()
export const extension = (format: ImageFormat) => format === 'jpeg' ? 'jpg' : format

export function sourceFormat(name: string): ImageFormat {
  const ext = name.split('.').pop()?.toLowerCase()
  return ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext === 'webp' || ext === 'avif' ? ext : 'png'
}

export function createExportOptions(): ExportOptions {
  const date = new Date(), pad = (value: number) => String(value).padStart(2, '0')
  return { format: 'original', naming: 'website', prefix: '', timestamp: `${String(date.getFullYear()).slice(-2)}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}` }
}

export function safeExportName(name: string) {
  const cleaned = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim().slice(0, 64).replace(/[. ]+$/g, '') || 'image'
  return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(cleaned) ? `_${cleaned}` : cleaned
}
export const resolveFormat = (options: ExportOptions, source: string) => options.format === 'original' ? sourceFormat(source) : options.format
export function exportBase(options: ExportOptions, source: string) {
  return options.naming === 'website' ? `LineNest-${options.timestamp}` : safeExportName(options.naming === 'custom' ? options.prefix : source.replace(/\.[^.]+$/, ''))
}
export const exportFileName = (options: ExportOptions, source: string, order: number) => `${exportBase(options, source)}-${order}.${extension(resolveFormat(options, source))}`

export async function supportsFormat(format: ImageFormat) {
  const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1
  return new Promise<boolean>(resolve => canvas.toBlob(blob => resolve(blob?.type === `image/${format}`), `image/${format}`))
}

export async function encodeImage(canvas: HTMLCanvasElement, format: ImageFormat): Promise<Blob> {
  let output = canvas
  if (format === 'jpeg') {
    output = document.createElement('canvas'); output.width = canvas.width; output.height = canvas.height
    const context = output.getContext('2d')
    if (!context) throw new Error('无法创建导出画布')
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, output.width, output.height); context.drawImage(canvas, 0, 0)
  }
  const blob = await new Promise<Blob | null>(resolve => output.toBlob(resolve, `image/${format}`, 0.95))
  if (output !== canvas) { output.width = 1; output.height = 1 }
  if (!blob) throw new Error('图片导出失败，图片可能过大')
  if (blob.type !== `image/${format}`) throw new Error(`当前浏览器不支持导出 ${formatLabel(format)}，请选择其他格式`)
  return blob
}
