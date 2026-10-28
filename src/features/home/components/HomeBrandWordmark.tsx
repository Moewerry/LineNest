const letters = Array.from('LineNest')

export function HomeBrandWordmark() {
  return <span className="inline-block whitespace-nowrap">
    <span className="sr-only">LineNest</span>
    <span aria-hidden="true">
      {letters.map((letter, index) => <span
        key={index}
        className="home-brand-letter inline-block"
        style={{ animationDelay: `calc(var(--home-content-start) + var(--home-icon-duration) + ${index * 140}ms)` }}
      >{letter}</span>)}
    </span>
  </span>
}
