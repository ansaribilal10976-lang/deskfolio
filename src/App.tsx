import { useEffect, useState } from 'react'
import { PullCord } from 'pullcord'
import 'pullcord/pullcord.css'
import { DeskFolio } from './deskfolio/deskfolio'
import './deskfolio/deskfolio.css'
import './App.css'
import { initIpodSticker } from './deskfolio-ipod-interactive'
import IntroBoot from './components/IntroBoot'
import PortfolioExtras from './components/PortfolioExtras'
import MumbaiClock from './components/MumbaiClock'
import HiddenTerminal from './components/HiddenTerminal'
import AvailabilityBadge from './components/AvailabilityBadge'
import SoundToggle from './components/SoundToggle'
import { initTypingSounds } from './components/sound'

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

// Between 11pm and 5am (visitor's own clock) the room starts with the lights off.
// The pull cord still toggles it any time.
function isNightForVisitor(): boolean {
  const h = new Date().getHours()
  return h >= 23 || h < 5
}

export default function App() {
  const [lightsOn, setLightsOn] = useState(() => !isNightForVisitor())
  const [showIntro, setShowIntro] = useState(() => !introSeenRecently())

  useEffect(() => {
    initIpodSticker()
    return initTypingSounds()
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
      <MumbaiClock />
      <AvailabilityBadge />
      <SoundToggle />
      <HiddenTerminal />
    </>
  )
}

