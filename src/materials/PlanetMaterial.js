import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

export const PlanetMaterial = shaderMaterial(
  {
    uSunPosition: new THREE.Vector3(0, 0, 0),
    uDayTexture: new THREE.Texture(), // Placeholder
    uNightTexture: new THREE.Texture(), // Placeholder,
    uNormalMap: new THREE.Texture(),
    uSpecularMap: new THREE.Texture(),
    uColor: new THREE.Color(),
    uTime: 0
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPositionWorld;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vPositionWorld = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uSunPosition;
    uniform sampler2D uDayTexture;
    uniform sampler2D uNightTexture;
    uniform vec3 uColor;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPositionWorld;
    
    void main() {
      // Direction to Sun
      vec3 sunDirection = normalize(uSunPosition - vPositionWorld);
      
      // Terminator (Day/Night mixing)
      float intensity = dot(vNormal, sunDirection);
      
      // Base Day Color (Lit by Sun)
      vec3 dayColor = uColor * max(0.1, intensity + 0.2); // soft ambient wrap
      
      // Night Color (Shadow side)
      vec3 nightColor = vec3(0.005, 0.005, 0.01); // Deep space blue/black
      
      // City Lights Simulation (Procedural)
      // Make a grid pattern that only shows up on the dark side and on land masses (simulated by noise if we had it)
      // For now, just a grid pattern using UVs
      float gridX = step(0.95, fract(vUv.x * 50.0));
      float gridY = step(0.95, fract(vUv.y * 50.0));
      float lights = gridX * gridY;
      
      // Mix Lights: Only visible when intensity is low
      // Use smoothstep to fade lights in as it gets dark (intensity < 0.2)
      // 1.0 at -0.2 (dark), 0.0 at 0.2 (twilight)
      float mixFactor = 1.0 - smoothstep(-0.2, 0.2, intensity);
      
      vec3 finalColor = mix(dayColor, nightColor, mixFactor);
      
      // Add city lights on top of night side
      // Make lights yellow/orange and SPARKLE
      float sparkle = 0.8 + 0.2 * sin(uTime * 3.0 + vUv.x * 10.0 + vUv.y * 10.0);
      finalColor += vec3(1.0, 0.8, 0.4) * lights * mixFactor * 2.0 * sparkle;

      gl_FragColor = vec4(finalColor, 1.0);
      
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
)

extend({ PlanetMaterial })
