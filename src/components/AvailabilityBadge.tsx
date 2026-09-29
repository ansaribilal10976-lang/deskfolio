import './studioExtras.css'

// Info-only badge. Flip this when you're fully booked.
// (The robot sticker already opens the project form, so this doesn't.)
const AVAILABLE = true
const LABEL_ON = 'Open for new projects'
const LABEL_OFF = 'Fully booked right now'

export default function AvailabilityBadge() {
  const label = AVAILABLE ? LABEL_ON : LABEL_OFF
  return (
    <div className={`av-badge ${AVAILABLE ? 'is-open' : 'is-full'}`} role="status" aria-label={label}>
      <span className="av-dot" aria-hidden="true" />
      <span className="av-text">{label}</span>
    </div>
  )
}
