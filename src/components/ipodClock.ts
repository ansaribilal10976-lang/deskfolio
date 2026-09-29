// Puts a small clock (Mumbai time) in the empty left slot of the iPod screen
// header, on both the desk sticker and the zoomed copy.
// Secret: tap the clock 5 times quickly inside the zoomed iPod to open the
// hidden terminal (works on phones).

const CLOCK_CLASS = 'ipod-clock'
const ZOOM_BACKDROP = '.df-ipod-zoom-backdrop'

function nowText(): string {
  try {
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(new Date())
    const h = parts.find((p) => p.type === 'hour')?.value ?? ''
    const m = parts.find((p) => p.type === 'minute')?.value ?? ''
    return h && m ? `${h}:${m}` : ''
  } catch {
    return ''
  }
}

function tick() {
  const text = nowText()
  if (!text) return
  document.querySelectorAll<HTMLElement>('.ipod .screen').forEach((screen) => {
    let el = screen.querySelector<HTMLElement>(`:scope > .${CLOCK_CLASS}`)
    if (!el) {
      el = document.createElement('span')
      el.className = CLOCK_CLASS
      el.setAttribute('aria-hidden', 'true')
      screen.appendChild(el)
    }
    if (el.textContent !== text) el.textContent = text
  })
}

let started = false

export function initIpodClock(): () => void {
  if (started) return () => {}
  started = true
  tick()
  const id = window.setInterval(tick, 1000)

  let taps: number[] = []
  const onClick = (e: MouseEvent) => {
    const t = e.target
    if (!(t instanceof HTMLElement) || !t.closest(`.${CLOCK_CLASS}`)) return
    if (!t.closest('.df-ipod-zoom-clone')) return
    const now = Date.now()
    taps = [...taps.filter((x) => now - x < 2000), now]
    if (taps.length >= 5) {
      taps = []
      document.querySelector<HTMLElement>(ZOOM_BACKDROP)?.click() // close the zoom
      window.dispatchEvent(new CustomEvent('obs-open-terminal'))
    }
  }
  document.addEventListener('click', onClick)

  return () => {
    started = false
    window.clearInterval(id)
    document.removeEventListener('click', onClick)
  }
}
