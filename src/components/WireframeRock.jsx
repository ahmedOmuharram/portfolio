import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const disableRaycast = () => null

const WireframeRock = ({
  position = [0, -1.4, -3],
  scale = 2.2
}) => {
  const gltf = useLoader(GLTFLoader, '/models/rock.glb')
  const groupRef = useRef(null)
  const basePosition = useMemo(() => new THREE.Vector3(...position), [position])

  const mainScene = useMemo(() => {
    const scene = gltf.scene.clone()
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xD9D5CF,
          roughness: 0.6,
          metalness: 0.1,
          emissive: new THREE.Color('#EC3107'),
          emissiveIntensity: 0.12,
        })
        child.castShadow = true
        child.raycast = disableRaycast
      }
    })
    return scene
  }, [gltf])

  const wireframeScene = useMemo(() => {
    const scene = gltf.scene.clone()
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.35,
        })
        child.raycast = disableRaycast
      }
    })
    return scene
  }, [gltf])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.12
    groupRef.current.rotation.x = Math.sin(t * 0.35) * 0.08
    groupRef.current.position.y = basePosition.y + Math.sin(t * 0.6) * 0.08
  })

  return (
    <group ref={groupRef} position={basePosition} scale={scale}>
      <primitive object={mainScene} />
      <primitive object={wireframeScene} />
    </group>
  )
}

export default WireframeRock
