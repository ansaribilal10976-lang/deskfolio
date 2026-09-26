import { useEffect, useState } from 'react'
import { PullCord } from 'pullcord'
import 'pullcord/pullcord.css'
import { DeskFolio } from './deskfolio/deskfolio'
import './deskfolio/deskfolio.css'
import './App.css'
import { initIpodSticker } from './deskfolio-ipod-interactive'
import IntroBoot from './components/IntroBoot'
import RotaryPhone from './components/RotaryPhone'
import StickyNote3D from './components/StickyNote3D'
import IPhoneMockup from './components/IPhoneMockup'
import DiscoveryQuiz from './components/DiscoveryQuiz'

export default function App() {
  const [lightsOn, setLightsOn] = useState(true)
  const [showIntro, setShowIntro] = useState(true)

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
      {!showIntro && (
        <>
          <RotaryPhone />
          <StickyNote3D />
          <IPhoneMockup />
          <DiscoveryQuiz />
        </>
      )}
      {showIntro && <IntroBoot onDone={() => setShowIntro(false)} />}
    </>
  )
}
