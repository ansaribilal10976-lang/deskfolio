import './studioExtras.css'

// Flip this when you're fully booked. Tapping the badge opens the project form.
const AVAILABLE = true
const LABEL_ON = 'Open for new projects'
const LABEL_OFF = 'Fully booked · join the waitlist'

export default function AvailabilityBadge() {
  const label = AVAILABLE ? LABEL_ON : LABEL_OFF
  return (
    <button
      type="button"
      className={`av-badge ${AVAILABLE ? 'is-open' : 'is-full'}`}
      aria-label={`${label}. Open the project form`}
      onClick={() => window.dispatchEvent(new CustomEvent('df-open-contact'))}
    >
      <span className="av-dot" aria-hidden="true" />
      <span className="av-text">{label}</span>
    </button>
  )
}
