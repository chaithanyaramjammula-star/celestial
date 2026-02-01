import { useRef, useMemo, useLayoutEffect, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function AsteroidBelt({ count = 5000 }) {
    const mesh = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), [])

    // Generate stable random data for each asteroid
    const asteroids = useMemo(() => {
        const data = []
        for (let i = 0; i < count; i++) {
            // Distance roughly between Mars (65) and Jupiter (120)
            // 80 to 95 units
            const radius = 80 + Math.random() * 15
            const angle = Math.random() * Math.PI * 2

            // speed factor
            const speed = (0.2 + Math.random() * 0.2) * (80 / radius)

            // Random scale
            const scale = 0.05 + Math.random() * 0.15

            // Random rotation axis
            const rotationSpeed = Math.random() * 0.02

            data.push({ radius, angle, speed, scale, rotationSpeed, yOffset: (Math.random() - 0.5) * 1.5 })
        }
        return data
    }, [count])

    // Initial setup
    useLayoutEffect(() => {
        if (!mesh.current) return
        asteroids.forEach((data, i) => {
            const { radius, angle, scale, yOffset } = data
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius

            dummy.position.set(x, yOffset, z)
            dummy.scale.set(scale, scale, scale)
            dummy.updateMatrix()
            mesh.current.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    }, [asteroids, dummy])

    // Animation Loop
    useFrame((state) => {
        if (!mesh.current) return

        const time = state.clock.getElapsedTime()

        asteroids.forEach((data, i) => {
            // Update orbital position
            // Speed is angular velocity here directly
            const currentAngle = data.angle + time * data.speed * 0.1 // slowing down time

            const x = Math.cos(currentAngle) * data.radius
            const z = Math.sin(currentAngle) * data.radius

            dummy.position.set(x, data.yOffset, z)

            // Self rotation (simple)
            dummy.rotation.x += data.rotationSpeed
            dummy.rotation.y += data.rotationSpeed

            dummy.scale.set(data.scale, data.scale, data.scale)

            dummy.updateMatrix()
            mesh.current.setMatrixAt(i, dummy.matrix)
        })

        mesh.current.instanceMatrix.needsUpdate = true
    })

    // Explicit Cleanup
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
            <dodecahedronGeometry args={[1, 0]} /> {/* Low poly asteroid shape */}
            {/* 
        Using a standard material for now. 
        Could add a custom shader for rock texture variation if efficient.
      */}
            <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
        </instancedMesh>
    )
}
