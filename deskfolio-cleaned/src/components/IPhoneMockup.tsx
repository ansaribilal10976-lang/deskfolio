import { useEffect, useRef, useState } from 'react'
import './IPhoneMockup.css'

type Msg = { from: 'me' | 'bilal'; text: string }

export default function IPhoneMockup() {
  const [unlocked, setUnlocked] = useState(false)
  const [time, setTime] = useState(() => formatTime())
  const [draft, setDraft] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'bilal', text: "Hey! Thanks for checking out my desk 🙌 What are you building?" },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const iv = setInterval(() => setTime(formatTime()), 15000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  function send() {
    const clean = draft.trim()
    if (!clean) return
    setMsgs((m) => [...m, { from: 'me', text: clean }])
    setDraft('')
    window.setTimeout(() => {
      setMsgs((m) => [...m, { from: 'bilal', text: "Got it — I'll get back to you within a day 👍" }])
    }, 500)
  }

  return (
    <div className="iph-shell">
      <div className="iph-notch" />
      {!unlocked ? (
        <div className="iph-lock">
          <div className="iph-lock-time">{time}</div>
          <div className="iph-lock-sub">Obsidian Studio</div>
          <button className="iph-unlock" onClick={() => setUnlocked(true)}>
            ↑ swipe up to unlock
          </button>
        </div>
      ) : (
        <div className="iph-chat">
          <div className="iph-chat-header">
            <span className="iph-avatar">B</span>
            Bilal Ansari
          </div>
          <div className="iph-chat-body" ref={scrollRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`iph-bubble iph-bubble-${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="iph-chat-input">
            <input
              value={draft}
              placeholder="iMessage"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button onClick={send} aria-label="Send">
              ↑
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime() {
  const d = new Date()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
