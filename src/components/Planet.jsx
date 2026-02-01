import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'



// Atmosphere Shader
const atmosphereVertexShader = `
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const atmosphereFragmentShader = `
varying vec3 vNormal;
varying vec3 vViewDir;
uniform vec3 uColor;

void main() {
  float fresnel = pow(1.0 - dot(vNormal, vViewDir), 3.0);
  gl_FragColor = vec4(uColor, 1.0) * fresnel * 2.0; // Boosted intensity
}
`



export default function Planet({ planet, ...props }) {
    const { radius, distance, speed, color, hasRings } = planet
    const groupRef = useRef()
    const materialRef = useRef()
    const [lodHigh, setLodHigh] = useState(false)

    // Random starting position for orbit
    // eslint-disable-next-line react-hooks/purity
    const initialAngle = useMemo(() => Math.random() * Math.PI * 2, [])

    // Strict Disposal
    useEffect(() => {
        return () => {
            if (groupRef.current) {
                groupRef.current.traverse((obj) => {
                    if (obj.geometry) obj.geometry.dispose()
                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach(m => m.dispose())
                        } else {
                            obj.material.dispose()
                        }
                    }
                })
            }
        }
    }, [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime() * speed * 0.5
        const angle = t + initialAngle
        const x = Math.sin(angle) * distance
        const z = Math.cos(angle) * distance

        if (groupRef.current) {
            groupRef.current.position.set(x, 0, z)
            groupRef.current.rotation.y += 0.01

            // LOD Check
            const dist = state.camera.position.distanceTo(groupRef.current.position)
            if (dist < 50 && !lodHigh) setLodHigh(true)
            if (dist > 50 && lodHigh) setLodHigh(false)

            // Update Earth Shader Time
            if (planet.name === 'Earth' && materialRef.current && materialRef.current.userData.shader) {
                materialRef.current.userData.shader.uniforms.uTime.value = state.clock.getElapsedTime();
            }
        }
    })

    return (
        <group ref={groupRef} {...props} onClick={(e) => {
            e.stopPropagation()
            props.onClick && props.onClick()
        }} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>

            {/* SAFE TEXTURE REPLACEMENT: Simple MeshStandardMaterial */}
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[radius, 32, 32]} />
                <meshStandardMaterial
                    ref={materialRef}
                    color={color}
                    roughness={0.8}
                    metalness={0.1}
                    onBeforeCompile={(shader) => {
                        if (planet.name === 'Earth') {
                            shader.uniforms.uTime = { value: 0 }
                            if (materialRef.current) {
                                materialRef.current.userData.shader = shader;
                            }

                            shader.fragmentShader = `
                                uniform float uTime;
                                varying vec3 vPositionWorld;
                            ` + shader.fragmentShader;

                            shader.vertexShader = `
                                varying vec3 vPositionWorld;
                            ` + shader.vertexShader;

                            shader.vertexShader = shader.vertexShader.replace(
                                '#include <worldpos_vertex>',
                                `
                                #include <worldpos_vertex>
                                vPositionWorld = (modelMatrix * vec4(position, 1.0)).xyz;
                                `
                            );

                            shader.fragmentShader = shader.fragmentShader.replace(
                                '#include <dithering_fragment>',
                                `
                                #include <dithering_fragment>
                                vec3 sunDir = normalize(vec3(0.0) - vPositionWorld); // Sun is at 0,0,0
                                float dayNight = dot(normalize(vNormal), sunDir);
                                float nightMix = 1.0 - smoothstep(-0.2, 0.2, dayNight);
                                
                                // Procedural City Lights
                                float grid = step(0.95, fract(vPositionWorld.x * 20.0)) * step(0.95, fract(vPositionWorld.y * 20.0));
                                // Sparkle
                                float sparkle = 0.5 + 0.5 * sin(uTime * 5.0 + vPositionWorld.x);
                                vec3 lights = vec3(1.0, 0.8, 0.4) * grid * nightMix * sparkle * 2.0;
                                
                                gl_FragColor.rgb += lights;
                                `
                            );
                        }
                    }}
                />
            </mesh>

            {hasRings && (
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[radius * 1.4, radius * 2.2, 64]} />
                    <meshStandardMaterial
                        color={color}
                        opacity={0.6}
                        transparent
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Simple Label for far view */}
            {/* {!lodHigh && <Html position={[0, radius + 2, 0]} center><div style={{color: color, fontSize: '0.8rem'}}>{name}</div></Html>} */}

            {/* Historical Markers - Proximity Reveal */}
            {lodHigh && planet.history && planet.history.map((h, i) => (
                <Html key={i} position={[radius * 1.5, radius, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
                    <div style={{
                        color: 'white',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        borderLeft: `2px solid ${color} `,
                        backdropFilter: 'blur(4px)',
                        opacity: 0.8
                    }}>
                        <div style={{ fontSize: '0.6rem', color: '#aaa' }}>HISTORICAL SITE</div>
                        {h.label}
                    </div>
                </Html>
            ))}
            {/* End of Children */}



            {/* Atmosphere Mesh */}
            {planet.hasAtmosphere && (
                <mesh scale={[1.05, 1.05, 1.05]}>
                    <sphereGeometry args={[radius, 32, 32]} />
                    <shaderMaterial
                        vertexShader={atmosphereVertexShader}
                        fragmentShader={atmosphereFragmentShader}
                        blending={THREE.AdditiveBlending}
                        side={THREE.BackSide}
                        transparent
                        uniforms={{
                            uColor: { value: new THREE.Color(0x00B0FF) } // Default blue atmosphere
                        }}
                    />
                </mesh>
            )}
        </group >
    )
}
