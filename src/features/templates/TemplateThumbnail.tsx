import { useEffect, useState } from 'react'
export function TemplateThumbnail({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const next = URL.createObjectURL(blob)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [blob])
  return <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">{url && <img src={url} alt="模板布局预览" className="h-full w-full object-contain" />}</div>
}
