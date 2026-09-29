import { useEffect, useState } from 'react'
import './studioExtras.css'
import { blip, isSoundOn, onSoundChange, setSoundOn } from './sound'

export default function SoundToggle() {
  const [on, setOn] = useState(() => isSoundOn())

  useEffect(() => onSoundChange(setOn), [])

  const toggle = () => {
    const next = !on
    setSoundOn(next)
    if (next) blip(true)
  }

  return (
    <button
      type="button"
      className={`st-btn ${on ? 'is-on' : 'is-off'}`}
      aria-label={on ? 'Mute sounds' : 'Unmute sounds'}
      aria-pressed={on}
      title={on ? 'Sound on' : 'Sound off'}
      onClick={toggle}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <>
            <path d="m16 9 5 6" />
            <path d="m21 9-5 6" />
          </>
        )}
      </svg>
    </button>
  )
}
