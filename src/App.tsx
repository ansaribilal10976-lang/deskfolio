import { useEffect, useState } from 'react'
import { PullCord } from 'pullcord'
import 'pullcord/pullcord.css'
import { DeskFolio } from './deskfolio/deskfolio'
import './deskfolio/deskfolio.css'
import './App.css'
import { initIpodSticker } from './deskfolio-ipod-interactive'
import IntroBoot from './components/IntroBoot'
import PortfolioExtras from './components/PortfolioExtras'

const INTRO_KEY = 'obs-intro-seen'
const INTRO_TTL = 7 * 24 * 60 * 60 * 1000

function introSeenRecently(): boolean {
  try {
    const t = Number(localStorage.getItem(INTRO_KEY))
    return t > 0 && Date.now() - t < INTRO_TTL
  } catch {
    return false
  }
}

function markIntroSeen() {
  try {
    localStorage.setItem(INTRO_KEY, String(Date.now()))
  } catch {
    /* storage unavailable: intro shows again next visit */
  }
}

export default function App() {
  const [lightsOn, setLightsOn] = useState(true)
  const [showIntro, setShowIntro] = useState(() => !introSeenRecently())

  useEffect(() => {
    initIpodSticker()
  }, [])

  return (
    <>
      <div className={lightsOn ? 'room' : 'room room--dark'}>
        <DeskFolio />
        <div className="room-dim" aria-hidden="true" />
        <PullCord
          onPull={() => setLightsOn((on) => !on)}
          pulled={!lightsOn}
          ariaLabel="Toggle the room light"
        />
      </div>
      {showIntro && <IntroBoot
          onDone={() => {
            markIntroSeen()
            setShowIntro(false)
          }}
        />}
      <PortfolioExtras />
    </>
  )
}

