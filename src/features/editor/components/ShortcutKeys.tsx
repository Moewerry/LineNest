export function ShortcutKeys({ keys }: { keys: readonly string[] }) {
  return <span className="inline-flex shrink-0 items-center gap-1">
    {keys.map(key => <kbd key={key} className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-current/15 bg-current/5 px-1 font-sans text-[10px] font-medium leading-none">{key}</kbd>)}
  </span>
}
