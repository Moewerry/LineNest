import { useEffect, useRef, useState } from 'react'

type HomeAnimatedTextProps = {
  children: string
  delay?: number
  stagger?: number
  repeatDelay?: number
  className?: string
}

export function HomeAnimatedText({ children, delay = 0, stagger = 30, repeatDelay, className }: HomeAnimatedTextProps) {
  const container = useRef<HTMLSpanElement>(null)
  const characterCount = Array.from(children).filter(character => !/\s/u.test(character)).length
  // Default to readable text; only hide pending characters while typing is active.
  const [visibleCount, setVisibleCount] = useState(characterCount)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let interval: ReturnType<typeof setInterval> | undefined
    let timeout: ReturnType<typeof setTimeout> | undefined
    const stop = () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
    const showAll = () => { stop(); setVisibleCount(characterCount) }
    if (motion.matches || !container.current) { showAll(); return }

    // Read the resolved CSS delay to stay in sync with the card entrance sequence.
    const computedDelay = getComputedStyle(container.current).animationDelay.split(',')[0].trim()
    const startDelay = parseFloat(computedDelay) * (computedDelay.endsWith('ms') ? 1 : 1000)
    const typeText = () => {
      let count = 0
      setVisibleCount(0)
      const tick = () => {
        count = Math.min(count + 1, characterCount)
        setVisibleCount(count)
        if (count >= characterCount) {
          clearInterval(interval)
          if (repeatDelay !== undefined && characterCount > 0) {
            timeout = setTimeout(typeText, Math.max(0, repeatDelay))
          }
        }
      }
      tick()
      if (count < characterCount) interval = setInterval(tick, Math.max(16, Math.round(stagger * 1.3)))
    }
    setVisibleCount(0)
    timeout = setTimeout(typeText, Number.isFinite(startDelay) ? Math.max(0, startDelay) : delay)
    const onMotionChange = () => { if (motion.matches) showAll() }
    motion.addEventListener('change', onMotionChange)
    return () => { stop(); motion.removeEventListener('change', onMotionChange) }
  }, [children, characterCount, delay, stagger, repeatDelay])

  let characterIndex = 0
  // Keep English words and trailing punctuation together when the text wraps.
  const tokens = children.match(/(?:[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*|[^\s])[，。！？、：；）》」』】…,.!?;:]*|\s+/gu) ?? []

  return <span ref={container} className={className} style={{ animationDelay: `calc(var(--home-content-start, 0ms) + ${delay}ms)` }}>
    <span className="sr-only">{children}</span>
    <span aria-hidden="true">
      {tokens.map((token, tokenIndex) => {
        if (/^\s+$/.test(token)) return token

        return <span key={tokenIndex} className="whitespace-nowrap">
          {Array.from(token).map(character => {
            const index = characterIndex++
            const cursor = index === visibleCount - 1 && visibleCount < characterCount
            return <span key={index} className={`relative inline-block${cursor ? ' home-typing-cursor' : ''}`} style={{ opacity: index < visibleCount ? 1 : 0 }}>{character}</span>
          })}
        </span>
      })}
    </span>
  </span>
}
