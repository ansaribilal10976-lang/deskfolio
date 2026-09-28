import { useCallback, useEffect, useRef, useState } from 'react'
import './PortfolioExtras.css'
import { TESTIMONIALS } from './testimonials'

const WHATSAPP_NUMBER = '919867529225' // country code 91 + number
const EMAIL = 'ba7992550@gmail.com'
const PROJECT_TYPES = ['Website', 'Web app', 'E-commerce store', 'Something else']

type Tab = 'contact' | 'reviews'

export default function PortfolioExtras() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('contact')
  const [name, setName] = useState('')
  const [type, setType] = useState(PROJECT_TYPES[0])
  const [message, setMessage] = useState('')
  const fabRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const hasReviews = TESTIMONIALS.length > 0

  const close = useCallback(() => {
    setOpen(false)
    fabRef.current?.focus()
  }, [])

  // Other parts of the site (e.g. iPod menu) can open these via:
  // window.dispatchEvent(new CustomEvent('df-open-contact'))
  useEffect(() => {
    const openContact = () => {
      setTab('contact')
      setOpen(true)
    }
    const openReviews = () => {
      setTab(TESTIMONIALS.length > 0 ? 'reviews' : 'contact')
      setOpen(true)
    }
    window.addEventListener('df-open-contact', openContact)
    window.addEventListener('df-open-reviews', openReviews)
    return () => {
      window.removeEventListener('df-open-contact', openContact)
      window.removeEventListener('df-open-reviews', openReviews)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    panelRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const valid = name.trim().length >= 2 && message.trim().length >= 5
  const text = `Hi Bilal, I'm ${name.trim()}. I'm looking for: ${type}.\n\n${message.trim()}`
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(`Project enquiry: ${type}`)}&body=${encodeURIComponent(text)}`

  const guard = (e: React.MouseEvent) => {
    if (!valid) e.preventDefault()
  }

  return (
    <div className="pe-root">
      <button
        ref={fabRef}
        type="button"
        className="pe-fab"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setTab('contact')
          setOpen(true)
        }}
      >
        <span aria-hidden="true">✉</span> Let&apos;s talk
      </button>

      {open && (
        <div
          className="pe-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <div
            ref={panelRef}
            className="pe-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pe-title"
            tabIndex={-1}
          >
            <button type="button" className="pe-close" aria-label="Close" onClick={close}>
              ✕
            </button>

            {hasReviews ? (
              <div className="pe-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'contact'}
                  className={tab === 'contact' ? 'is-active' : ''}
                  onClick={() => setTab('contact')}
                >
                  Contact
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'reviews'}
                  className={tab === 'reviews' ? 'is-active' : ''}
                  onClick={() => setTab('reviews')}
                >
                  Reviews
                </button>
              </div>
            ) : null}

            {tab === 'contact' || !hasReviews ? (
              <div className="pe-body">
                <h2 id="pe-title" className="pe-title">
                  Got a project?
                </h2>
                <p className="pe-sub">Tell me what you need. I usually reply within a day.</p>

                <label className="pe-label" htmlFor="pe-name">
                  Your name
                </label>
                <input
                  id="pe-name"
                  className="pe-input"
                  value={name}
                  maxLength={60}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                />

                <label className="pe-label" htmlFor="pe-type">
                  What do you need?
                </label>
                <select
                  id="pe-type"
                  className="pe-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <label className="pe-label" htmlFor="pe-msg">
                  Message
                </label>
                <textarea
                  id="pe-msg"
                  className="pe-input pe-textarea"
                  rows={4}
                  maxLength={600}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <div className="pe-actions">
                  <a
                    className="pe-btn pe-btn--wa"
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!valid}
                    onClick={guard}
                  >
                    Send on WhatsApp
                  </a>
                  <a className="pe-btn pe-btn--mail" href={mailHref} aria-disabled={!valid} onClick={guard}>
                    Send by email
                  </a>
                </div>
                {!valid && <p className="pe-hint">Naam aur message bhar do, phir buttons chalenge.</p>}
              </div>
            ) : (
              <div className="pe-body">
                <h2 id="pe-title" className="pe-title">
                  Kind words
                </h2>
                <ul className="pe-reviews">
                  {TESTIMONIALS.map((t) => (
                    <li key={`${t.name}-${t.quote.slice(0, 12)}`} className="pe-review">
                      <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                      <p className="pe-review-by">
                        {t.name}
                        {t.role ? <span> · {t.role}</span> : null}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
