type HomeAnimatedTextProps = {
  children: string
  delay?: number
  stagger?: number
  className?: string
}

export function HomeAnimatedText({ children, delay = 0, stagger = 30, className }: HomeAnimatedTextProps) {
  let characterIndex = 0
  // Keep English words and trailing punctuation together when the text wraps.
  const tokens = children.match(/(?:[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*|[^\s])[，。！？、：；）》」』】…,.!?;:]*|\s+/gu) ?? []

  return <span className={className}>
    <span className="sr-only">{children}</span>
    <span aria-hidden="true">
      {tokens.map((token, tokenIndex) => {
        if (/^\s+$/.test(token)) return token

        return <span key={tokenIndex} className="whitespace-nowrap">
          {Array.from(token).map(character => {
            const index = characterIndex++
            return <span key={index} className="home-text-character inline-block origin-bottom" style={{ animationDelay: `calc(var(--home-content-start) + ${delay + index * stagger}ms)` }}>{character}</span>
          })}
        </span>
      })}
    </span>
  </span>
}
