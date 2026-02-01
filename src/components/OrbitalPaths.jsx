import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

function Orbit({ radius, isActive }) {
    const materialRef = useRef()

    // Create the orbit path geometry
    const geometry = useMemo(() => {
        // EllipseCurve(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation)
        const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0)
        const points = curve.getPoints(128)

        // Convert to 3D points (x, z plane)
        const positions = []
        points.forEach(p => positions.push(p.x, 0, p.y)) // map y to z

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        return geo
    }, [radius])

    // Cleanup geometry on unmount
    useEffect(() => {
        return () => geometry.dispose()
    }, [geometry])

    // Animate glow/highlight
    useFrame((state, delta) => {
        if (materialRef.current) {
            // Base opacity 0.1, pulse if active
            const targetOpacity = isActive ? 0.6 : 0.1
            const colorIsWhite = true // always white for "Shadow" path

            // We can just lerp the opacity for smooth transition
            materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, delta * 3)

            // Optional: thickness (linewidth is hard in WebGL usually 1, so rely on opacity)
        }
    })

    return (
        <line loop geometry={geometry}>
            <lineBasicMaterial
                ref={materialRef}
                color={0xffffff}
                transparent
                opacity={0.1}
                depthWrite={false}
                toneMapped={false}
            />
        </line>
    )
}

export default function OrbitalPaths({ planets, activePlanet }) {
    return (
        <group>
            {planets.map(planet => (
                <Orbit
                    key={planet.name}
                    radius={planet.distance}
                    isActive={activePlanet?.name === planet.name}
                />
            ))}
        </group>
    )
}
