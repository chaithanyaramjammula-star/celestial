import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import Planet from './Planet'

export default function LODPlanet({ planet, ...props }) {
    const group = useRef()
    const [isClose, setIsClose] = useState(false)

    useFrame((state) => {
        if (group.current) {
            // Calculate World Position of the planet group
            // But wait, the planet MOVES in orbit inside the Planet component (or here?)
            // In the previous breakdown, Planet component handled Orbit. 
            // We need the LOD to wrap the orbit or be inside it?
            // IF LODPlanet wraps Planet, and Planet handles Orbit, then LODPlanet doesn't know where the planet IS unless Planet exposes it or we move orbital logic UP.
            // Moving Orbital Logic UP to LODPlanet is cleaner.

            // Let's reimplement Orbital Logic here so we know where it is, 
            // OR checks the distance to the Group (which is centering the orbit).
            // NO, the distance is to the PLANET BODY, not the sun (0,0,0).

            // REFACTOR STRATEGY: 
            // Planet.jsx currently computes position: x = sin(t)*dist, z = cos(t)*dist.
            // We need to access that position to check distance to camera.
            // 
            // EASIER: Put the LOD logic INSIDE Planet.jsx. 
            // "Every planet ... must utilize ... LOD Gating"
            // Let's modify Planet.jsx to handle its own LOD. simple.
        }
    })

    return <Planet planet={planet} {...props} />
}
