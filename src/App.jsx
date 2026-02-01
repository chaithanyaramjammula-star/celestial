import { useState } from 'react'
import Scene from './Scene'
import HUD from './components/HUD'

function App() {
  const [activePlanet, setActivePlanet] = useState(null)
  const [started, setStarted] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <Scene onPlanetSelect={setActivePlanet} activePlanet={activePlanet} started={started} />

      {activePlanet && <HUD planet={activePlanet} onClose={() => setActivePlanet(null)} />}

      {/* Initialization Overlay */}
      {!started && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{ color: 'white', fontSize: '4rem', letterSpacing: '0.5em', marginBottom: '2rem', fontFamily: 'Orbitron, sans-serif' }}>CELESTIAL ATLAS</h1>
          <p style={{ color: '#aaa', marginBottom: '4rem', letterSpacing: '0.2em' }}>SUPREME GENESIS // DIRECTIVE_2.0</p>
          <button
            onClick={() => setStarted(true)}
            style={{
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              letterSpacing: '0.2em',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
            onMouseOver={(e) => { e.target.style.background = 'white'; e.target.style.color = 'black' }}
            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'white' }}
          >
            INITIALIZE
          </button>
        </div>
      )}
    </div>
  )
}

export default App
