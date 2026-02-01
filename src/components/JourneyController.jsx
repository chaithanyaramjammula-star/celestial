import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Lenis from '@studio-freight/lenis'

export default function JourneyController({ started, onComplete }) {
    const { camera } = useThree()
    const lenisRef = useRef()

    useEffect(() => {
        // Initialize Lenis for inertial scroll
        const lenis = new Lenis({
            duration: 2, // Smoothness
            leasing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential
            smoothWheel: true,
            smoothTouch: true,
        })
        lenisRef.current = lenis

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
        }
    }, [])

    useEffect(() => {
        if (started) {
            // GALACTIC SLINGSHOT
            // Move from Z=5000 (Overview) to Z=200 (Solar System)

            // Set initial position if not already (assuming App sets it, but force it here)
            camera.position.set(0, 1000, 5000)
            camera.lookAt(0, 0, 0)

            const tl = gsap.timeline()

            tl.to(camera.position, {
                x: 0,
                y: 50,
                z: 200,
                duration: 4,
                ease: "power4.inOut", // Cinematic ease
                onUpdate: () => camera.lookAt(0, 0, 0)
            })
                // Transition to orbital plane
                .to(camera.position, {
                    y: 40, // Match CameraRig start (roughly)
                    z: 60,
                    duration: 3,
                    ease: "power2.out",
                    onUpdate: () => camera.lookAt(0, 0, 0),
                    onComplete: () => { if (onComplete) onComplete() }
                })
        }
    }, [started, camera, onComplete])

    return null
}
