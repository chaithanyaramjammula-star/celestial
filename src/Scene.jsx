import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls, Stars, SoftShadows } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

import Sun from './components/Sun'
import Planet from './components/Planet'
import AsteroidBelt from './components/AsteroidBelt'

import JourneyController from './components/JourneyController'
import CameraRig from './components/CameraRig'
import OrbitalPaths from './components/OrbitalPaths'
import Starfield from './components/Starfield'
import { planets } from './data/planets'

import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'

function PerformanceMonitor() {
    const { gl, scene, renderer } = useThree()

    useEffect(() => {
        const interval = setInterval(() => {
            console.log('--- Hardware Check ---')
            console.log('Geometries:', gl.info.memory.geometries)
            console.log('Textures:', gl.info.memory.textures)
            console.log('Render Calls:', gl.info.render.calls)
        }, 2000)

        return () => {
            clearInterval(interval)
            console.log('--- Cleanup Phase ---')
            scene.clear()
            gl.dispose()
            console.log('Scene Cleared & Renderer Disposed')
        }
    }, [gl, scene])

    return null
}

export default function Scene({ onPlanetSelect, activePlanet, started }) {
    const [introFinished, setIntroFinished] = useState(false)
    const controlsRef = useRef()

    return (
        <Canvas
            shadows
            camera={{ position: [0, 20, 25], fov: 45, far: 5000 }}
            gl={{ toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
        >
            <SoftShadows size={40} samples={16} focus={0.5} />
            <ambientLight intensity={0.05} />
            <color attach="background" args={['#000000']} />
            <PerformanceMonitor />

            <JourneyController started={started} onComplete={() => setIntroFinished(true)} />

            {/* CameraRig takes over after intro for smooth exploration */}
            {introFinished && <CameraRig planets={planets} activePlanet={activePlanet} controlsRef={controlsRef} />}
            {introFinished && <OrbitalPaths planets={planets} activePlanet={activePlanet} />}

            <OrbitControls
                ref={controlsRef}
                enableZoom={true}
                minDistance={5}
                maxDistance={500}
                enableDamping
                dampingFactor={0.1}
                rotateSpeed={0.5}
                enabled={true}
            />

            <Sun position={[0, 0, 0]} />

            <EffectComposer>
                {/* Selective Bloom: High threshold so only Sun (emissive > 1) glows */}
                <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.9} height={300} intensity={1.5} radius={0.4} />
            </EffectComposer>

            {planets.map((planet) => (
                <Planet
                    key={planet.name}
                    planet={planet}
                    onClick={() => onPlanetSelect(planet)}
                />
            ))}

            <AsteroidBelt />
            <Starfield count={100000} />



        </Canvas>
    )
}
