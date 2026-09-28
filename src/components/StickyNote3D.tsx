import { useEffect, useRef, useState } from 'react'
import './StickyNote3D.css'

type Pinned = { id: string; text: string; rot: number }

const STORAGE_KEY = 'obsidian-pinned-notes'

export default function StickyNote3D() {
  const [text, setText] = useState('write a note…')
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [pinned, setPinned] = useState<Pinned[]>([])
  const noteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setPinned(JSON.parse(raw))
    } catch {
      /* ignore corrupt storage */
    }
  }, [])

  function persist(next: Pinned[]) {
    setPinned(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = noteRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    const clamp = (v: number) => Math.max(-20, Math.min(20, v))
    setTilt({ rx: clamp(-py * 32), ry: clamp(px * 32) })
  }

  function resetTilt() {
    setTilt({ rx: 0, ry: 0 })
  }

  function pinNote() {
    const clean = text.trim()
    if (!clean) return
    const next: Pinned = {
      id: `${Date.now()}`,
      text: clean.slice(0, 60),
      rot: Math.round(Math.random() * 16 - 8),
    }
    persist([...pinned, next])
    setText('write a note…')
    resetTilt()
  }

  function removePinned(id: string) {
    persist(pinned.filter((p) => p.id !== id))
  }

  return (
    <div className="snote-wrap">
      <div
        ref={noteRef}
        className="snote"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      >
        <p className="snote-text">{text || 'write a note…'}</p>
      </div>
      <input
        className="snote-input"
        value={text}
        maxLength={60}
        placeholder="type your note…"
        onChange={(e) => setText(e.target.value)}
      />
      <button className="snote-pin" onClick={pinNote}>
        📌 Pin to board
      </button>

      {pinned.length > 0 && (
        <div className="snote-board">
          {pinned.map((p) => (
            <div
              key={p.id}
              className="snote-mini"
              style={{ transform: `rotate(${p.rot}deg)` }}
              onClick={() => removePinned(p.id)}
              title="Tap to remove"
            >
              {p.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
