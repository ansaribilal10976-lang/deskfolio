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

/** Soft mechanical key click. Slightly randomised so it never sounds robotic. */
export function typeSound(strong = false) {
  const now = performance.now()
  if (now - last < 28) return
  last = now
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  const src = c.createBufferSource()
  src.buffer = noise(c)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = (strong ? 1500 : 2200) + Math.random() * 900
  bp.Q.value = 0.9
  const g = c.createGain()
  const peak = (strong ? 0.22 : 0.14) * (0.8 + Math.random() * 0.4)
  g.gain.setValueAtTime(peak, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045)
  src.connect(bp).connect(g).connect(c.destination)
  src.start(t)
  src.stop(t + 0.05)
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
