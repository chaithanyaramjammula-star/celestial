import React, { useEffect, useState } from 'react'

export default function HUD({ planet, onClose }) {
    const [velocity, setVelocity] = useState(0)

    useEffect(() => {
        // Simulate real-time velocity fluctuation
        const interval = setInterval(() => {
            // Base speed * random factor to look like real-time telemetry
            const baseV = planet.speed * 100 // Arbitrary scale for display
            setVelocity((baseV + Math.random() * 0.5).toFixed(2))
        }, 100)
        return () => clearInterval(interval)
    }, [planet])

    if (!planet) return null

    return (
        <div style={{
            position: 'absolute',
            top: '5%',
            right: '2%',
            width: '350px',
            background: 'rgba(10, 10, 15, 0.4)', // Darker tint
            backdropFilter: 'blur(20px)', // High blur
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px', // Technical look
            padding: '0',
            color: '#eee',
            fontFamily: '"Orbitron", "Inter", sans-serif',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
            overflow: 'hidden',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '0.1em', color: '#fff' }}>
                    {planet.name.toUpperCase()}
                </h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        lineHeight: 1
                    }}
                >
                    &times;
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#bbb', marginBottom: '24px' }}>
                    {planet.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                    <Stat label="ORBITAL PERIOD" value={planet.orbitPeriod} />
                    <Stat label="GRAVITY" value={`${planet.gravity} m/s²`} />
                    <Stat label="MEAN TEMP" value={planet.temp} />
                    <Stat label="VELOCITY" value={`${velocity} km/s`} active />
                    <Stat label="COMPOSITION" value={planet.composition} full />
                </div>
            </div>

            {/* Footer / Decorative */}
            <div style={{
                height: '4px',
                background: 'linear-gradient(90deg, #00f260, #0575e6)',
                width: '100%'
            }} />
        </div>
    )
}

function Stat({ label, value, active, full }) {
    return (
        <div style={{ gridColumn: full ? 'span 2' : 'span 1', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px' }}>
            <div style={{ color: '#555', fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '4px', fontWeight: 'bold' }}>{label}</div>
            <div style={{ color: active ? '#00f260' : 'white', fontSize: '1rem', fontFamily: 'monospace' }}>
                {value}
            </div>
        </div>
    )
}
