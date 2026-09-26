import { useState } from 'react'
import './DiscoveryQuiz.css'

type Biz = 'Business site' | 'Real estate listing' | 'Personal portfolio'
type Budget = '₹10k–20k' | '₹20k–40k' | '₹40k+'
type Timeline = 'This week' | '2–3 weeks' | 'No rush'

const TURNAROUND: Record<Timeline, string> = {
  'This week': '3–4 days',
  '2–3 weeks': '10–14 days',
  'No rush': '2–3 weeks',
}

export default function DiscoveryQuiz() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [biz, setBiz] = useState<Biz | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [timeline, setTimeline] = useState<Timeline | null>(null)

  function reset() {
    setStep(1)
    setBiz(null)
    setBudget(null)
    setTimeline(null)
  }

  function close() {
    setOpen(false)
    reset()
  }

  return (
    <>
      <button className="dq-launcher" onClick={() => setOpen(true)}>
        ✦ Get an instant quote
      </button>

      {open && (
        <div className="dq-overlay" onClick={close}>
          <div className="dq-card" onClick={(e) => e.stopPropagation()}>
            <button className="dq-close" onClick={close} aria-label="Close">
              ×
            </button>
            <div className="dq-dots">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={`dq-dot ${step >= n ? 'dq-dot-on' : ''}`} />
              ))}
            </div>

            {step === 1 && (
              <QuizStep
                title="What are you building?"
                options={['Business site', 'Real estate listing', 'Personal portfolio']}
                onPick={(v) => {
                  setBiz(v as Biz)
                  setStep(2)
                }}
              />
            )}
            {step === 2 && (
              <QuizStep
                title="Budget range?"
                options={['₹10k–20k', '₹20k–40k', '₹40k+']}
                onPick={(v) => {
                  setBudget(v as Budget)
                  setStep(3)
                }}
              />
            )}
            {step === 3 && (
              <QuizStep
                title="How soon do you need it live?"
                options={['This week', '2–3 weeks', 'No rush']}
                onPick={(v) => {
                  setTimeline(v as Timeline)
                  setStep(4)
                }}
              />
            )}
            {step === 4 && biz && budget && timeline && (
              <div className="dq-result">
                <div className="dq-result-label">Your fit</div>
                <div className="dq-result-title">{biz}</div>
                <div className="dq-row">
                  <span>Budget band</span>
                  <b>{budget}</b>
                </div>
                <div className="dq-row">
                  <span>Turnaround</span>
                  <b>{TURNAROUND[timeline]}</b>
                </div>
                <div className="dq-row">
                  <span>Built with</span>
                  <b>AI + Obsidian Studio</b>
                </div>
                <a
                  className="dq-cta"
                  href="mailto:ansari.bilal10976@gmail.com?subject=Project%20enquiry"
                >
                  Lock this in →
                </a>
                <button className="dq-restart" onClick={reset}>
                  Start over
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function QuizStep({
  title,
  options,
  onPick,
}: {
  title: string
  options: string[]
  onPick: (v: string) => void
}) {
  return (
    <div className="dq-step">
      <h3>{title}</h3>
      <div className="dq-options">
        {options.map((o) => (
          <button key={o} className="dq-option" onClick={() => onPick(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
