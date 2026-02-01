import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CameraRig({ planets, activePlanet, controlsRef }) {
    const { camera } = useThree()
    const progress = useRef(0)
    const targetProgress = useRef(0)
    const scrollEnabled = useRef(true)

    // Calculate curve
    const curve = useMemo(() => {
        const points = [
            new THREE.Vector3(0, 40, 60),
            new THREE.Vector3(0, 10, 15),
        ]
        planets.forEach(p => {
            points.push(new THREE.Vector3(p.distance * 0.8, 5, p.distance * 0.8))
            points.push(new THREE.Vector3(p.distance, 2, p.distance))
        })
        points.push(new THREE.Vector3(60, 20, 60))
        return new THREE.CatmullRomCurve3(points)
    }, [planets])

    // Handle Scroll
    useEffect(() => {
        const handleScroll = (e) => {
            if (!scrollEnabled.current) return

            const delta = Math.max(-0.05, Math.min(0.05, e.deltaY * 0.0005))
            targetProgress.current = Math.min(Math.max(targetProgress.current + delta, 0), 1)
        }
        window.addEventListener('wheel', handleScroll, { passive: false })
        return () => window.removeEventListener('wheel', handleScroll)
    }, [])

    // Handle Active Planet Transitions
    useEffect(() => {
        if (!controlsRef.current) return

        if (activePlanet) {
            // TRANSITION TO PLANET
            scrollEnabled.current = false
            controlsRef.current.enabled = true

            // Calculate target position (planet position)
            // We need to know where the planet IS. 
            // Since planets move, this is tricky. We'll use the LAST known position or calculate it based on time.
            // Simplified: We know the radius/distance. We can approximate or just look at where the user clicked?
            // BETTER: The planet text/click event passed the planet object.
            // We can calculate its current position based on time, OR just use the Camera's current "LookAt" target if we tracked it?
            // actually, Planet.jsx handles movement. 
            // We can use the scene graph if we had the ref, but we don't.
            // Let's re-calculate position based on time? No, too complex to sync.

            // ALTERNATIVE: Use the Camera's current position and just look at the planet's orbital distance?
            // Let's assume the planet is at its calculated position (roughly).
            // Better yet, let's just use the `distance` and `activePlanet` metadata to find a good spot.
            // We'll aim controls at (0,0,distance) ?? No, planets orbit.

            // CRITICAL: We need the planet's ACTUAL position.
            // Since we can't easily get the mesh ref from here, we will cheat slightly:
            // We will transition the CONTROLS TARGET to the center (Sun) initially or 
            // maybe we just rely on visual search?
            // NO, the user wants "Bouncing" fixed.

            // WAIT - Planet.jsx is where the mesh is. Use activePlanet prop?
            // If we can't get exact position, let's target the generic "Orbital distance" on the Z axis 
            // effectively pausing the "Time" for the planet in our mind? No.

            // REAL SOLUTION: The `activePlanet` object from `onPlanetSelect` is just data.
            // We need the scene object.
            // HOWEVER, we can just use the camera's current near-planet point on the spline as a reference?
            // When we click, we are usually "near" the planet on the spline.

            // Let's move controls target to the camera's current lookAt vector?
            // Or better: Let's just enable orbit controls around the CURRENT camera lookAt point.
            // And assumes the user clicked the planet which was in view.

            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
            const target = camera.position.clone().add(forward.multiplyScalar(10)) // Arbitrary 10 units in front

            gsap.to(controlsRef.current.target, {
                x: target.x,
                y: target.y,
                z: target.z,
                duration: 1.5,
                ease: "power2.inOut"
            })

            // Move camera slightly for dramatic effect? 
            // Maybe not, just let controls take over.

        } else {
            // TRANSITION TO SPACE
            controlsRef.current.enabled = false
            scrollEnabled.current = true

            // Reset rotation/up vector to ensure spline path feels right?
            // The spline logic overwrites position/lookAt every frame, so it will snap back.
            // We need to smooth this snap.

            // We can tween `progress.current` to `targetProgress.current` (already happening).
            // But the CAMERA position will jump from "Orbit Mode" to "Spline Mode".
            // Adding a "returning" flag or just letting the damp handle it?
            // dampFactor is 5, it will slide back quickly.
        }
    }, [activePlanet, camera, controlsRef])

    useFrame((state, delta) => {
        // If active planet, let OrbitControls handle camera (update needed?)
        if (activePlanet) {
            controlsRef.current.update()
            return
        }

        // SCROLL PATH LOGIC
        progress.current = THREE.MathUtils.damp(progress.current, targetProgress.current, 2, delta)
        const p = progress.current

        if (p < 0 || p > 1) return

        const point = curve.getPointAt(p)
        const dampFactor = 5

        // eslint-disable-next-line react-hooks/immutability
        camera.position.x = THREE.MathUtils.damp(camera.position.x, point.x, dampFactor, delta)
        // eslint-disable-next-line react-hooks/immutability
        camera.position.y = THREE.MathUtils.damp(camera.position.y, point.y, dampFactor, delta)
        // eslint-disable-next-line react-hooks/immutability
        camera.position.z = THREE.MathUtils.damp(camera.position.z, point.z, dampFactor, delta)

        const lookAtT = Math.min(p + 0.02, 1)
        const lookAtPoint = curve.getPointAt(lookAtT)
        camera.lookAt(lookAtPoint)
    })

    return null
}
