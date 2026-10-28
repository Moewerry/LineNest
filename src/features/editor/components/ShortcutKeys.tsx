export function ShortcutKeys({ keys, variant = 'keycap' }: { keys: readonly string[]; variant?: 'keycap' | 'highlight' }) {
  return <span className="inline-flex shrink-0 items-center gap-1">
    {keys.map(key => <kbd key={key} className={variant === 'highlight'
      ? 'inline-flex h-5 min-w-5 items-center justify-center whitespace-nowrap rounded-md bg-primary px-1.5 font-sans text-[11px] font-semibold leading-none text-white'
      : 'inline-flex h-5 min-w-5 items-center justify-center rounded border border-current bg-transparent px-1 font-sans text-[10px] font-medium leading-none'}>{key}</kbd>)}
  </span>
}
