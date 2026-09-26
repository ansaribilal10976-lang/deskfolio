import { useRef, useState } from 'react'
import './IntroBoot.css'

const LINES = [
  'resolving modules…',
  'compiling components…',
  'bundling assets [128 files]',
  'optimizing & minifying…',
]

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export default function IntroBoot({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'boot' | 'done'>('idle')
  const [typed, setTyped] = useState<string[]>(['', '', '', ''])
  const [pct, setPct] = useState(0)
  const [buildDone, setBuildDone] = useState(false)
  const running = useRef(false)

  async function typeLine(i: number, text: string) {
    for (let c = 1; c <= text.length; c++) {
      setTyped((prev) => {
        const next = [...prev]
        next[i] = text.slice(0, c)
        return next
      })
      await wait(14)
    }
  }

  async function run() {
    if (running.current) return
    running.current = true
    setPhase('boot')
    await wait(150)
    for (let i = 0; i < LINES.length; i++) {
      await typeLine(i, LINES[i])
      await wait(90)
    }
    await wait(120)
    await new Promise<void>((res) => {
      let p = 0
      const iv = setInterval(() => {
        p += 2 + Math.random() * 3
        if (p >= 100) {
          p = 100
          clearInterval(iv)
          res()
        }
        setPct(Math.floor(p))
      }, 28)
    })
    setBuildDone(true)
    await wait(500)
    setPhase('done')
    await wait(450)
    onDone()
  }

  return (
    <div className={`cobs-stage ${phase === 'done' ? 'cobs-exit' : ''}`}>
      <div className={`cobs-idle ${phase !== 'idle' ? 'cobs-hide' : ''}`}>
        <div className="cobs-diamond" />
        <div className="cobs-name">Bilal Ansari</div>
        <div className="cobs-tag">Web Design Studio</div>
        <button className="cobs-start" onClick={run}>
          <span className="cobs-dot" />
          Start
        </button>
      </div>

      {phase !== 'idle' && (
        <div className="cobs-term">
          <div className="cobs-ln cobs-on">
            <span className="cobs-prompt">$</span> obsidian build --prod
          </div>
          {typed.map((t, i) => (
            <div key={i} className={`cobs-ln ${t ? 'cobs-on' : ''}`}>
              {t}
            </div>
          ))}
          <div className="cobs-barTrack">
            <div className="cobs-barFill" style={{ width: `${pct}%` }} />
          </div>
          <div className="cobs-pct">{pct > 0 ? `${pct}%` : ''}</div>
          <div className={`cobs-done ${buildDone ? 'cobs-on' : ''}`}>
            ✓ build complete 100%
          </div>
        </div>
      )}
    </div>
  )
}
