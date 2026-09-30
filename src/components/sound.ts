// Tiny synthesized sound engine (no audio files). Used for typing sounds + UI blips.
// The on/off choice is remembered in localStorage and shared via a window event.

const KEY = 'obs-sound'
const EVENT = 'obs-sound-change'
const DEFAULT_ON = true

let ctx: AudioContext | null = null
let noiseBuf: AudioBuffer | null = null
let last = 0

export function isSoundOn(): boolean {
  try {
    const v = localStorage.getItem(KEY)
    return v === null ? DEFAULT_ON : v === '1'
  } catch {
    return DEFAULT_ON
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    /* storage unavailable: choice lasts until reload */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: on }))
}

export function onSoundChange(fn: (on: boolean) => void): () => void {
  const h = (e: Event) => fn(Boolean((e as CustomEvent).detail))
  window.addEventListener(EVENT, h)
  return () => window.removeEventListener(EVENT, h)
}

function getCtx(): AudioContext | null {
  if (!isSoundOn()) return null
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function noise(c: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.06), c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return noiseBuf
}

/** Soft, low "thock" key tap (no sharp noise burst, so it never sounds like crackers). */
export function typeSound(strong = false) {
  const now = performance.now()
  if (now - last < 45) return
  last = now
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  const base = (strong ? 150 : 200) + Math.random() * 40

  // body: a short low sine that drops in pitch
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(base, t)
  o.frequency.exponentialRampToValueAtTime(base * 0.55, t + 0.06)
  const g = c.createGain()
  const peak = (strong ? 0.09 : 0.06) * (0.85 + Math.random() * 0.3)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + 0.08)

  // tiny muffled tick for a bit of texture, low-passed so it stays soft
  const src = c.createBufferSource()
  src.buffer = noise(c)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  const ng = c.createGain()
  ng.gain.setValueAtTime(0.012, t)
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
  src.connect(lp).connect(ng).connect(c.destination)
  src.start(t)
  src.stop(t + 0.04)
}

/** Short two-note blip: rising = on / success, falling = off. */
export function blip(rising = true) {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  const notes = rising ? [660, 990] : [660, 440]
  notes.forEach((f, i) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    const g = c.createGain()
    const s = t + i * 0.08
    g.gain.setValueAtTime(0.0001, s)
    g.gain.exponentialRampToValueAtTime(0.12, s + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.14)
    o.connect(g).connect(c.destination)
    o.start(s)
    o.stop(s + 0.16)
  })
}

/** Global typing sounds for any text field on the page (terminal, contact form). */
export function initTypingSounds(): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
    const el = e.target
    if (!(el instanceof HTMLElement)) return
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) return
    typeSound(e.key === 'Enter' || e.key === ' ' || e.key === 'Backspace')
  }
  document.addEventListener('keydown', onKey, true)
  return () => document.removeEventListener('keydown', onKey, true)
}
