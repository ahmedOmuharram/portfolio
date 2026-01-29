import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

function BrainModel() {
  const gltf = useLoader(GLTFLoader, '/models/brain_hologram.glb')
  const groupRef = useRef(null)
  const { gl } = useThree()
  const rotationSpeed = useRef(0)
  const dragRotation = useRef(0)
  const isDragging = useRef(false)
  const previousMouseX = useRef(0)
  const lastMoveTime = useRef(0)

  const { mainScene, wireScene } = useMemo(() => {
    const main = gltf.scene.clone()
    const wire = gltf.scene.clone()

    main.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#EC3107'),
          roughness: 0.45,
          metalness: 0.15,
          emissive: new THREE.Color('#EC3107'),
          emissiveIntensity: 1,
          transparent: false,
          opacity: 1,
        })
        child.castShadow = true
      }
    })

    wire.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: 0xFFD3C7,
          transparent: true,
          opacity: 0.9,
        })
      }
    })

    const box = new THREE.Box3().setFromObject(main)
    const center = box.getCenter(new THREE.Vector3())
    main.position.set(-center.x, -center.y, -center.z)
    wire.position.set(-center.x, -center.y, -center.z)

    return { mainScene: main, wireScene: wire }
  }, [gltf])

  useEffect(() => {
    const canvas = gl.domElement
    canvas.style.pointerEvents = 'auto'
    canvas.style.touchAction = 'none'
    canvas.style.cursor = 'grab'

    const handleDown = (event) => {
      if (document.body.dataset.activeSection !== 'about') return
      isDragging.current = true
      previousMouseX.current = event.clientX
      lastMoveTime.current = performance.now()
      canvas.setPointerCapture?.(event.pointerId)
      canvas.style.cursor = 'grabbing'
    }

    const handleMove = (event) => {
      if (!isDragging.current) return
      const deltaX = event.clientX - previousMouseX.current
      const now = performance.now()
      const dt = Math.max(1, now - lastMoveTime.current)
      dragRotation.current += deltaX * 0.001
      rotationSpeed.current = (deltaX / dt) * 0.10
      lastMoveTime.current = now
      previousMouseX.current = event.clientX
    }

    const handleUp = (event) => {
      isDragging.current = false
      canvas.releasePointerCapture?.(event.pointerId)
      canvas.style.cursor = 'grab'
    }

    canvas.addEventListener('pointerdown', handleDown)
    canvas.addEventListener('pointermove', handleMove)
    canvas.addEventListener('pointerup', handleUp)
    canvas.addEventListener('pointerleave', handleUp)
    canvas.addEventListener('pointercancel', handleUp)

    return () => {
      canvas.removeEventListener('pointerdown', handleDown)
      canvas.removeEventListener('pointermove', handleMove)
      canvas.removeEventListener('pointerup', handleUp)
      canvas.removeEventListener('pointerleave', handleUp)
      canvas.removeEventListener('pointercancel', handleUp)
    }
  }, [gl])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    if (!isDragging.current && Math.abs(rotationSpeed.current) > 0.0005) {
      rotationSpeed.current *= 0.85
    } else if (!isDragging.current) {
      rotationSpeed.current = 0
    }
    dragRotation.current += rotationSpeed.current
    groupRef.current.rotation.y = t * 0.15 + dragRotation.current
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.08
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.12
  })

  return (
    <group ref={groupRef} scale={1.6} position={[0, -0.2, 0]}>
      <primitive object={mainScene} />
      <primitive object={wireScene} />
    </group>
  )
}

const WireframeBrain = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45, near: 0.1, far: 100 }}
      style={{ width: '100%', height: '100%', background: 'transparent', cursor: 'grab' }}
      shadows
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 6]} intensity={1.4} castShadow />
      <directionalLight position={[-5, -3, 4]} intensity={0.6} />
      <pointLight position={[-3, -1, 4]} intensity={0.9} color="#EC3107" />
      <BrainModel />
    </Canvas>
  )
}

export default WireframeBrain
