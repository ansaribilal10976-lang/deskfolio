const COLORS = ['#c9a24a', '#e6c877', '#7fa3c7', '#f2efe6']

/** Small gold confetti burst. Skipped for reduced-motion users. */
export function burstConfetti(count = 60) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText =
    'position:fixed;top:0;right:0;bottom:0;left:0;z-index:9500;pointer-events:none;overflow:hidden'
  document.body.appendChild(layer)

  const w = window.innerWidth
  const h = window.innerHeight

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span')
    const size = 5 + Math.random() * 6
    p.style.cssText =
      `position:absolute;left:${w / 2}px;top:${h * 0.4}px;width:${size}px;height:${size * 0.5}px;` +
      `background:${COLORS[i % COLORS.length]};border-radius:1px`
    layer.appendChild(p)
    if (typeof p.animate !== 'function') continue

    const angle = Math.random() * Math.PI * 2
    const dist = 120 + Math.random() * Math.min(w, h) * 0.6
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist - 80 + h * 0.35
    const rot = (Math.random() - 0.5) * 900
    p.animate(
      [
        { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 1400 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
    )
  }

  window.setTimeout(() => layer.remove(), 2600)
}
