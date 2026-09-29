import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import './studioExtras.css'
import { burstConfetti } from './confetti'

type LineKind = 'in' | 'out' | 'accent' | 'muted'
type Line = { id: number; kind: LineKind; text: string; href?: string }
type Out = Omit<Line, 'id'>
type Action = 'clear' | 'exit' | 'hire' | 'secret' | 'intro' | null

const EMAIL = 'ansari.bilal10976@gmail.com'
const CHIPS = ['help', 'whoami', 'projects', 'services', 'contact', 'hire', 'intro']
const KONAMI = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a',
]

const out = (text: string, kind: LineKind = 'out', href?: string): Out => ({ kind, text, href })

const WELCOME: Out[] = [
  out('obsidian shell — you found the hidden terminal ◆', 'accent'),
  out('type help, or tap a command below.', 'muted'),
]

function mumbaiTime(): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
      .format(new Date())
      .toUpperCase()
  } catch {
    return new Date().toLocaleTimeString()
  }
}

function respond(key: string): { lines: Out[]; action: Action } {
  switch (key) {
    case 'help':
      return {
        lines: [
          out('commands:', 'muted'),
          out('  whoami     who is behind this'),
          out('  projects   work I can show'),
          out('  services   what I build'),
          out('  stack      tools I use'),
          out('  contact    ways to reach me'),
          out('  hire       open the project form'),
          out('  time       Mumbai time now'),
          out('  intro      replay the boot intro'),
          out('  clear      wipe the screen'),
          out('  exit       close'),
        ],
        action: null,
      }
    case 'whoami':
      return {
        lines: [out('Bilal Ansari — founder, Obsidian Studio'), out('web designer in Mumbra, Thane', 'muted')],
        action: null,
      }
    case 'projects':
      return {
        lines: [
          out('Stone Mount Group — real estate developer site'),
          out('stonemountgroup.in', 'out', 'https://stonemountgroup.in'),
        ],
        action: null,
      }
    case 'services':
      return {
        lines: [
          out('- business websites'),
          out('- real estate sites'),
          out('- portfolios & landing pages'),
          out('- client intake & payments (Supabase)'),
        ],
        action: null,
      }
    case 'stack':
      return { lines: [out('React · Vite · TypeScript · Supabase')], action: null }
    case 'contact':
      return {
        lines: [
          out(EMAIL, 'out', `mailto:${EMAIL}`),
          out('instagram.com/obsidian.studio.web', 'out', 'https://instagram.com/obsidian.studio.web'),
          out('github.com/ansaribilal10976-lang', 'out', 'https://github.com/ansaribilal10976-lang'),
        ],
        action: null,
      }
    case 'time':
    case 'date':
      return { lines: [out(`Mumbai · ${mumbaiTime()} IST`)], action: null }
    case 'ls':
      return { lines: [out('projects  services  stack  contact')], action: null }
    case 'pwd':
      return { lines: [out('~/obsidian-studio')], action: null }
    case 'sudo':
      return { lines: [out('nice try. permission denied ◆', 'muted')], action: null }
    case 'hire':
      return { lines: [out('opening the project form…', 'accent')], action: 'hire' }
    case 'intro':
      return { lines: [out('replaying intro…', 'accent')], action: 'intro' }
    case 'secret':
      return {
        lines: [
          out('you found it ◆', 'accent'),
          out('curious people make the best clients.'),
          out('type hire and let’s build something.', 'muted'),
        ],
        action: 'secret',
      }
    case 'clear':
    case 'cls':
      return { lines: [], action: 'clear' }
    case 'exit':
    case 'quit':
      return { lines: [out('bye ◆', 'muted')], action: 'exit' }
    default:
      return { lines: [out(`command not found: ${key} — type help`, 'muted')], action: null }
  }
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

export default function HiddenTerminal() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [lines, setLines] = useState<Line[]>(() => WELCOME.map((l, i) => ({ ...l, id: -(i + 1) })))

  const idRef = useRef(1)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)
  const skipRestoreRef = useRef(false)
  const histRef = useRef<string[]>([])
  const histIdxRef = useRef(0)

  const push = useCallback((items: Out[]) => {
    const withIds = items.map((i) => ({ ...i, id: idRef.current++ }))
    setLines((prev) => [...prev, ...withIds])
  }, [])

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim()
      if (!cmd) return
      histRef.current.push(cmd)
      histIdxRef.current = histRef.current.length
      const key = cmd.split(/\s+/)[0].toLowerCase()
      const { lines: res, action } = respond(key)
      if (action === 'clear') {
        setLines([])
        return
      }
      push([{ kind: 'in', text: cmd }, ...res])
      if (action === 'exit') window.setTimeout(() => setOpen(false), 250)
      if (action === 'secret') burstConfetti()
      if (action === 'intro') {
        try {
          localStorage.removeItem('obs-intro-seen')
        } catch {
          /* storage unavailable */
        }
        window.setTimeout(() => window.location.reload(), 500)
      }
      if (action === 'hire') {
        skipRestoreRef.current = true
        window.setTimeout(() => {
          setOpen(false)
          window.dispatchEvent(new CustomEvent('df-open-contact'))
        }, 450)
      }
    },
    [push],
  )

  // Global openers: ` or ~ key, Konami code, or the event fired by the clock pill.
  useEffect(() => {
    let pos = 0
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isTypingTarget(e.target)) {
        pos = 0
        return
      }
      const k = e.key.toLowerCase()
      if (k === '`' || k === '~') {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      if (k === KONAMI[pos]) {
        pos += 1
        if (pos === KONAMI.length) {
          pos = 0
          setOpen(true)
          burstConfetti()
        }
      } else {
        pos = k === KONAMI[0] ? 1 : 0
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('obs-open-terminal', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('obs-open-terminal', onOpen)
    }
  }, [])

  // Open state: focus, scroll lock, Escape, focus trap.
  useEffect(() => {
    if (!open) return
    prevFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // On phones keep the keyboard closed at first so the command chips stay visible.
    const coarse = window.matchMedia?.('(pointer: coarse)').matches
    if (coarse) panelRef.current?.focus({ preventScroll: true })
    else inputRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      if (skipRestoreRef.current) skipRestoreRef.current = false
      else prevFocusRef.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, open])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    run(value)
    setValue('')
  }

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    const h = histRef.current
    if (!h.length) return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      histIdxRef.current = Math.max(0, histIdxRef.current - 1)
      setValue(h[histIdxRef.current] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      histIdxRef.current = Math.min(h.length, histIdxRef.current + 1)
      setValue(h[histIdxRef.current] ?? '')
    }
  }

  if (!open) return null

  return (
    <div
      className="ht-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div ref={panelRef} className="ht-panel" role="dialog" aria-modal="true" aria-label="Hidden terminal" tabIndex={-1}>
        <div className="ht-bar">
          <span className="ht-dot ht-dot--r" />
          <span className="ht-dot ht-dot--y" />
          <span className="ht-dot ht-dot--g" />
          <span className="ht-title">obsidian — ~/bilal</span>
          <button type="button" className="ht-x" aria-label="Close terminal" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <div ref={bodyRef} className="ht-body" role="log" aria-live="polite">
          {lines.map((l) => (
            <div key={l.id} className={`ht-ln ht-ln--${l.kind}`}>
              {l.kind === 'in' && <span className="ht-prompt">$ </span>}
              {l.href ? (
                <a
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                >
                  {l.text}
                </a>
              ) : (
                l.text
              )}
            </div>
          ))}
        </div>

        <div className="ht-chips">
          {CHIPS.map((c) => (
            <button key={c} type="button" className="ht-chip" onClick={() => run(c)}>
              {c}
            </button>
          ))}
        </div>

        <form className="ht-form" onSubmit={onSubmit}>
          <span className="ht-prompt" aria-hidden="true">
            $
          </span>
          <input
            ref={inputRef}
            className="ht-input"
            value={value}
            maxLength={60}
            aria-label="Terminal command"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onInputKey}
          />
        </form>
      </div>
    </div>
  )
}
