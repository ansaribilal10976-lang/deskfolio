import { useCallback, useEffect, useRef, useState } from 'react'
import './RobotSticker.css'

const STORE_KEY = 'pe-robot-v1'
const HINT_KEY = 'pe-robot-hint-seen'
const BASE_W = 120 // px at size 1
const ASPECT = 226 / 200
const MIN_S = 0.55
const MAX_S = 2.4
const TAP_SLOP = 6 // px of movement before a tap becomes a drag

type St = { x: number; y: number; s: number }

const maxScale = () =>
  Math.min(MAX_S, window.innerWidth / BASE_W, window.innerHeight / (BASE_W * ASPECT))

function clampState(st: St): St {
  const s = Math.min(Math.max(st.s, MIN_S), maxScale())
  const w = BASE_W * s
  const h = w * ASPECT
  return {
    s,
    x: Math.min(Math.max(0, st.x), Math.max(0, window.innerWidth - w)),
    y: Math.min(Math.max(0, st.y), Math.max(0, window.innerHeight - h)),
  }
}

function load(): St {
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<St>
      if ([p.x, p.y, p.s].every((n) => typeof n === 'number' && Number.isFinite(n))) {
        return clampState(p as St)
      }
    }
  } catch {
    /* storage blocked: fall through to default */
  }
  return clampState({
    s: 1,
    x: window.innerWidth - BASE_W - 14,
    y: window.innerHeight - BASE_W * ASPECT - 18,
  })
}

type Props = { onOpen: () => void; ref?: React.Ref<HTMLDivElement> }

export default function RobotSticker({ onOpen, ref }: Props) {
  const [st, setSt] = useState<St>(load)
  const [dragging, setDragging] = useState(false)
  const [hint, setHint] = useState(false)
  const stRef = useRef(st)
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null)
  const size = useRef<{ sx: number; sy: number; s0: number } | null>(null)

  useEffect(() => {
    stRef.current = st
  }, [st])

  const persist = useCallback(() => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(stRef.current))
    } catch {
      /* ignore */
    }
  }, [])

  const dismissHint = useCallback(() => {
    setHint(false)
    try {
      window.localStorage.setItem(HINT_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  // keep it on screen when the viewport changes (rotate phone, resize window)
  useEffect(() => {
    const onResize = () => setSt((p) => clampState(p))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // one-time little "psst" bubble, after the intro is done
  useEffect(() => {
    let seen = false
    try {
      seen = window.localStorage.getItem(HINT_KEY) === '1'
    } catch {
      /* ignore */
    }
    if (seen) return
    const a = window.setTimeout(() => setHint(true), 5000)
    const b = window.setTimeout(() => setHint(false), 12000)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [])

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== undefined && e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { sx: e.clientX, sy: e.clientY, ox: st.x, oy: st.y, moved: false }
  }

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (!d.moved && Math.hypot(dx, dy) < TAP_SLOP) return
    if (!d.moved) {
      d.moved = true
      setDragging(true)
      dismissHint()
    }
    setSt((p) => clampState({ ...p, x: d.ox + dx, y: d.oy + dy }))
  }

  const onUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (d.moved) {
      setDragging(false)
      persist()
    } else {
      dismissHint()
      onOpen()
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen()
    }
  }

  // --- resize handle ---
  const onSizeDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    size.current = { sx: e.clientX, sy: e.clientY, s0: st.s }
    setDragging(true)
    dismissHint()
  }
  const onSizeMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const z = size.current
    if (!z) return
    const delta = (e.clientX - z.sx + (e.clientY - z.sy)) / 2
    const next = z.s0 + delta / BASE_W
    setSt((p) => clampState({ ...p, s: next }))
  }
  const onSizeUp = () => {
    if (!size.current) return
    size.current = null
    setDragging(false)
    persist()
  }
  const resetSize = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSt((p) => clampState({ ...p, s: 1 }))
    window.setTimeout(persist, 0)
  }

  const w = BASE_W * st.s

  return (
    <div
      ref={ref}
      className={`rs-root${dragging ? ' is-dragging' : ''}`}
      style={{ left: st.x, top: st.y, width: w }}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label="Open contact form. Drag to move the robot."
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
    >
      {hint && (
        <span className={`rs-hint${st.y < 70 ? ' is-below' : ''}`} aria-hidden="true">
          Got a project? 👋
        </span>
      )}
      <img
        className="rs-img"
        src={`${import.meta.env.BASE_URL}stickers/items/sticker-robot-helper.svg`}
        alt=""
        draggable={false}
      />
      <button
        type="button"
        className="rs-size"
        aria-label="Resize robot (drag). Double-tap to reset."
        onPointerDown={onSizeDown}
        onPointerMove={onSizeMove}
        onPointerUp={onSizeUp}
        onPointerCancel={onSizeUp}
        onDoubleClick={resetSize}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path d="M4 12 12 4M8 12l4-4M12 12v0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      </button>
    </div>
  )
}
