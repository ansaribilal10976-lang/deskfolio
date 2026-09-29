import { useEffect, useRef, useState } from 'react'
import './IntroBoot.css'
import { blip, typeSound } from './sound'

const LINES = [
  'resolving modules…',
  'compiling components…',
  'bundling assets [128 files]',
  'optimizing & minifying…',
]
const TOTAL_FILES = 128

export default function IntroBoot({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'boot' | 'flash' | 'done'>('idle')
  const [typed, setTyped] = useState<string[]>(LINES.map(() => ''))
  const [pct, setPct] = useState(0)
  const [buildDone, setBuildDone] = useState(false)
  const [showSkip, setShowSkip] = useState(false)

  const running = useRef(false)
  const skipped = useRef(false)
  const pending = useRef<Set<() => void>>(new Set())

  function wait(ms: number) {
    if (skipped.current) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(id)
        pending.current.delete(done)
        resolve()
      }
      const id = setTimeout(done, ms)
      pending.current.add(done)
    })
  }

  function skip() {
    if (skipped.current || phase === 'idle') return
    skipped.current = true
    pending.current.forEach((r) => r())
    pending.current.clear()
    setTyped(LINES)
    setPct(100)
    setBuildDone(true)
  }

  useEffect(() => {
    if (phase !== 'boot') return
    const t = window.setTimeout(() => setShowSkip(true), 900)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [phase])

  async function typeLine(i: number, text: string) {
    for (let c = 1; c <= text.length; c++) {
      if (skipped.current) return
      if (c % 2 === 1) typeSound()
      setTyped((prev) => {
        const next = [...prev]
        next[i] = text.slice(0, c)
        return next
      })
      await wait(13)
    }
  }

  async function run() {
    if (running.current) return
    running.current = true
    typeSound(true)
    setPhase('boot')
    await wait(200)
    for (let i = 0; i < LINES.length; i++) {
      await typeLine(i, LINES[i])
      await wait(80)
    }
    await wait(150)

    await new Promise<void>((resolve) => {
      if (skipped.current) {
        setPct(100)
        resolve()
        return
      }
      let p = 0
      const tick = () => {
        if (skipped.current) {
          clearInterval(iv)
          pending.current.delete(tick)
          setPct(100)
          resolve()
          return
        }
        p += 2 + Math.random() * 3
        if (p >= 100) {
          p = 100
          clearInterval(iv)
          pending.current.delete(tick)
          resolve()
        }
        setPct(Math.floor(p))
      }
      const iv = window.setInterval(tick, 26)
      pending.current.add(tick)
    })

    setBuildDone(true)
    blip(true)
    setShowSkip(false)
    await wait(550)
    setPhase('flash')
    await wait(220)
    setPhase('done')
    await wait(480)
    onDone()
  }

  const filesDone = Math.min(TOTAL_FILES, Math.round((pct / 100) * TOTAL_FILES))

  return (
    <div
      className={`cobs-stage ${phase === 'flash' ? 'cobs-flashing' : ''} ${
        phase === 'done' ? 'cobs-exit' : ''
      }`}
    >
      <div className="cobs-grid" aria-hidden="true" />
      <div className="cobs-vignette" aria-hidden="true" />

      <div className={`cobs-idle ${phase !== 'idle' ? 'cobs-hide' : ''}`}>
        <div className="cobs-mark">
          <span className="cobs-ring" />
          <span className="cobs-diamond" />
        </div>
        <div className="cobs-name">Bilal Ansari</div>
        <div className="cobs-tag">Web Design Studio</div>
        <button className="cobs-start" onClick={run}>
          <span className="cobs-dot" />
          Start
        </button>
      </div>

      {phase !== 'idle' && (
        <div className="cobs-term">
          <div className="cobs-term-card">
            <div className="cobs-term-bar">
              <span className="cobs-tdot cobs-tdot--r" />
              <span className="cobs-tdot cobs-tdot--y" />
              <span className="cobs-tdot cobs-tdot--g" />
              <span className="cobs-term-title">obsidian — build --prod</span>
            </div>
            <div className="cobs-term-inner">
              <div className="cobs-ln cobs-on">
                <span className="cobs-prompt">$</span> obsidian build --prod
              </div>
              {typed.map((t, i) => {
                const complete = t === LINES[i]
                const active = t.length > 0 && !complete
                return (
                  <div key={i} className={`cobs-ln ${t ? 'cobs-on' : ''}`}>
                    {t}
                    {active && <span className="cobs-cursor" />}
                    {complete && <span className="cobs-check">✓</span>}
                  </div>
                )
              })}

              <div className="cobs-barRow">
                <div className="cobs-barTrack">
                  <div className="cobs-barFill" style={{ width: `${pct}%` }} />
                </div>
                <span className="cobs-pct">{pct}%</span>
              </div>
              <div className="cobs-files">
                {filesDone}/{TOTAL_FILES} files
              </div>

              <div className={`cobs-done ${buildDone ? 'cobs-on' : ''}`}>
                <span className="cobs-doneGlitch">✓ build complete</span>
              </div>
            </div>
          </div>

          {showSkip && (
            <button className="cobs-skip" onClick={skip}>
              skip <span className="cobs-skipArrow">→</span>
            </button>
          )}
        </div>
      )}

      <div className="cobs-flash" aria-hidden="true" />
    </div>
  )
}
