import { useEffect, useRef, useState } from 'react'
import './RotaryPhone.css'

const GREETINGS = [
  "Hey, thanks for stopping by my desk 👋 — ask me anything about a project.",
  "Oh, hi there! Feel free to poke around — everything on this desk is clickable.",
  "You picked up! I build sites like this one — want to talk about yours?",
]

export default function RotaryPhone() {
  const [ringing, setRinging] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [greeting, setGreeting] = useState('')
  const ringTimer = useRef<number | null>(null)

  useEffect(() => {
    ringTimer.current = window.setTimeout(() => {
      setRinging(true)
    }, 3200)
    return () => {
      if (ringTimer.current) clearTimeout(ringTimer.current)
    }
  }, [])

  function answer() {
    if (answered) return
    setRinging(false)
    setAnswered(true)
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  }

  return (
    <button
      className={`rphone ${ringing ? 'rphone-ring' : ''} ${answered ? 'rphone-answered' : ''}`}
      onClick={answer}
      aria-label={answered ? 'Call connected' : 'Incoming call — tap to answer'}
    >
      <svg viewBox="0 0 64 64" className="rphone-icon" aria-hidden="true">
        <circle cx="32" cy="24" r="19" fill="#2b2b30" stroke="#c9a24b" strokeWidth="2" />
        <circle cx="32" cy="24" r="13" fill="#1a1a1d" />
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2
          const x = 32 + Math.cos(angle) * 9
          const y = 24 + Math.sin(angle) * 9
          return <circle key={i} cx={x} cy={y} r="2.1" fill="#e8b95f" />
        })}
        <rect x="14" y="42" width="36" height="9" rx="4.5" fill="#2b2b30" stroke="#c9a24b" strokeWidth="1.5" />
        <path d="M20 42 C20 34, 44 34, 44 42" fill="none" stroke="#c9a24b" strokeWidth="2.5" />
      </svg>
      {ringing && !answered && <span className="rphone-badge">Incoming…</span>}
      {answered && (
        <div className="rphone-greeting">
          <span className="rphone-status">● connected</span>
          <p>{greeting}</p>
        </div>
      )}
    </button>
  )
}
