import { useRef, useMemo, useLayoutEffect, useEffect } from 'react'
import * as THREE from 'three'

export default function Starfield({ count = 100000 }) {
    const mesh = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), [])

    // Generate 100k particles simulating a Milky Way galaxy
    const particles = useMemo(() => {
        /* eslint-disable react-hooks/purity */
        const data = []
        for (let i = 0; i < count; i++) {
            // Galaxy Logic
            // 60% in the Disk (Band), 40% in Sphere (Halo)
            const isDisk = Math.random() < 0.6

            let x, y, z

            if (isDisk) {
                // Disk: Wide Radius, Thin Height
                const r = 1500 + Math.random() * 2500 // 1500-4000 distance
                const theta = Math.random() * Math.PI * 2

                // Concentration in the plane (Gaussian-ish)
                const ySpread = Math.pow(Math.random(), 3) * 300 * (Math.random() < 0.5 ? 1 : -1)

                x = r * Math.cos(theta)
                y = ySpread // Thin vertical band
                z = r * Math.sin(theta)
            } else {
                // Sphere: Background stars
                const r = 2000 + Math.random() * 3000
                const theta = 2 * Math.PI * Math.random()
                const phi = Math.acos(2 * Math.random() - 1)

                x = r * Math.sin(phi) * Math.cos(theta)
                y = r * Math.sin(phi) * Math.sin(theta)
                z = r * Math.cos(phi)
            }

            const scale = 0.5 + Math.random() * 1.5 // Larger stars

            data.push({ x, y, z, scale })
        }
        /* eslint-enable react-hooks/purity */
        return data
    }, [count])

    useLayoutEffect(() => {
        if (!mesh.current) return

        /* eslint-disable react-hooks/purity */
        // Fill the instance matrix
        particles.forEach((particle, i) => {
            dummy.position.set(particle.x, particle.y, particle.z)
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
            dummy.scale.set(particle.scale, particle.scale, particle.scale)
            dummy.updateMatrix()
            mesh.current.setMatrixAt(i, dummy.matrix)

            // Star Color Classification:
            // 60% White/Blue-White (Young stars)
            // 20% Yellow/Gold (Sun-like)
            // 20% Red/Orange (Giants)
            const color = new THREE.Color()
            const r = Math.random()
            if (r > 0.8) {
                color.setHSL(Math.random() * 0.1, 0.8, 0.6) // Red/Orange
            } else if (r > 0.6) {
                color.setHSL(0.1 + Math.random() * 0.05, 0.6, 0.7) // Gold
            } else {
                color.setHSL(0.6 + Math.random() * 0.1, 0.2, 0.9) // Blue/White
            }
            mesh.current.setColorAt(i, color)
        })
        /* eslint-enable react-hooks/purity */

        mesh.current.instanceMatrix.needsUpdate = true
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
    }, [particles, dummy])

    // STRICT DISPOSAL
    useEffect(() => {
        return () => {
            if (mesh.current) {
                mesh.current.geometry.dispose()
                if (Array.isArray(mesh.current.material)) {
                    mesh.current.material.forEach(m => m.dispose())
                } else {
                    mesh.current.material.dispose()
                }
            }
        }
    }, [])

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            {/* 
         Tetrahedron is the cheapest 3D shape (4 vertices). 
         Radius 1.0, Detail 0.
      */}
            <tetrahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </instancedMesh>
    )
}
