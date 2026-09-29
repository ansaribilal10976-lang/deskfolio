import { useEffect, useRef, useState } from 'react'
import './studioExtras.css'

type Snap = { time: string; online: boolean }

// Studio hours in IST: 9:00 to 22:59 counts as "online".
function snapshot(): Snap {
  const now = new Date()
  try {
    const time = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(now)
    const hour = Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        hourCycle: 'h23',
      }).format(now),
    )
    return { time: time.toUpperCase(), online: hour >= 9 && hour < 23 }
  } catch {
    return { time: '', online: false }
  }
}

export default function MumbaiClock() {
  const [snap, setSnap] = useState<Snap>(() => snapshot())
  const taps = useRef<number[]>([])

  useEffect(() => {
    const id = window.setInterval(() => setSnap(snapshot()), 15000)
    return () => window.clearInterval(id)
  }, [])

  if (!snap.time) return null

  const status = snap.online ? 'online' : 'away · replies in the morning'

  // Secret: 5 quick taps opens the hidden terminal (works on phones too).
  const onTap = () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < 2000), now]
    if (taps.current.length >= 5) {
      taps.current = []
      window.dispatchEvent(new CustomEvent('obs-open-terminal'))
    }
  }

  return (
    <button
      type="button"
      className={`sc-clock ${snap.online ? 'is-online' : 'is-away'}`}
      aria-label={`Mumbai time ${snap.time}, ${status}`}
      onClick={onTap}
    >
      <span className="sc-dot" aria-hidden="true" />
      <span className="sc-time">Mumbai {snap.time}</span>
      <span className="sc-status">· {status}</span>
    </button>
  )
}
