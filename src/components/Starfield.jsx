import { useRef, useMemo, useLayoutEffect, useEffect } from 'react'
import * as THREE from 'three'

export default function Starfield({ count = 100000 }) {
    const mesh = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), [])

    // Generate 100k stable random positions
    const particles = useMemo(() => {
        const data = []
        for (let i = 0; i < count; i++) {
            // Distribute in a visible range (Background layer)
            // Z-depth needs to be huge for parallax feel, but careful with frustum culling
            const r = 1000 + Math.random() * 2000 // 1000 to 3000 units away
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            const scale = 0.2 + Math.random() * 0.8 // Varies size

            data.push({ x, y, z, scale })
        }
        return data
    }, [count])

    useLayoutEffect(() => {
        if (!mesh.current) return

        // Fill the instance matrix
        particles.forEach((particle, i) => {
            dummy.position.set(particle.x, particle.y, particle.z)
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
            dummy.scale.set(particle.scale, particle.scale, particle.scale)
            dummy.updateMatrix()
            mesh.current.setMatrixAt(i, dummy.matrix)

            // Randomize color: mostly white/blueish, some rare red giants
            const color = new THREE.Color()
            if (Math.random() > 0.95) {
                color.setHSL(Math.random() * 0.1, 0.8, 0.8) // Red/Orange tint
            } else {
                color.setHSL(0.6 + Math.random() * 0.1, 0.2, 0.9) // Blue/White
            }
            mesh.current.setColorAt(i, color)
        })

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
