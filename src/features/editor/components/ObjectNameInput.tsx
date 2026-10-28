import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { renameObject } from '../commands/object-list'

export function ObjectNameInput({ id, name, locked, onEditingChange }: {
  id: string; name: string; locked: boolean; onEditingChange: (editing: boolean) => void
}) {
  const [editing, setEditing] = useState(false), [value, setValue] = useState(name)
  const input = useRef<HTMLInputElement>(null), cancelled = useRef(false)
  useEffect(() => {
    if (editing) { input.current?.focus(); input.current?.select() }
  }, [editing])
  const begin = () => {
    if (locked || editing) return
    cancelled.current = false
    setValue(name); setEditing(true); onEditingChange(true)
  }
  const finish = () => {
    if (!editing) return
    if (!cancelled.current) renameObject(id, value)
    setEditing(false); onEditingChange(false)
  }

  return <Input ref={input} data-object-name data-editing={editing} aria-label={`对象名称：${name}`} title={locked ? '请先解锁对象' : '单击编辑对象名称'}
    value={editing ? value : name} readOnly={!editing || locked} maxLength={80}
    className={cn('h-8 min-w-0 flex-1 cursor-text truncate rounded-sm border-0 bg-transparent px-1 py-1 text-xs text-inherit shadow-none transition-none hover:bg-transparent focus-visible:border-transparent focus-visible:ring-0 md:text-xs', editing && 'bg-foreground text-card hover:bg-foreground')}
    onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); begin() }} onDoubleClick={event => event.stopPropagation()}
    onChange={event => setValue(event.target.value)} onBlur={finish}
    onKeyDown={event => {
      event.stopPropagation()
      if (event.nativeEvent.isComposing) return
      if (!editing && ['Enter', 'F2'].includes(event.key)) { event.preventDefault(); begin() }
      else if (editing && event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() }
      else if (editing && event.key === 'Escape') { event.preventDefault(); cancelled.current = true; event.currentTarget.blur() }
    }}
  />
}
