import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useTheme } from '../ThemeProvider'
import { useIsMobile } from '../useIsMobile'

function RedCircleWithText({ color = '#000000', glow = false }) {
  return (
    <group>
      {/* Text behind circle */}
      <Text
        position={[0, 0, 0.5]}
        fontSize={4}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/StarlightRune.ttf"
        material-toneMapped={!glow}
      >
        MUHA   RRAM
      </Text>
    </group>
  )
}

// Hand centre placement + size. Rotation happens around the model's own centre,
// so this just positions/sizes it; y is also driven by the float in useFrame.
const HAND_POS = [0, 0.2, 3.4]
const HAND_SCALE = 7

function HandModel({ isDark }) {
  const gltf = useLoader(GLTFLoader, '/models/hand.glb')
  const handGroupRef = useRef()
  const rotationRef = useRef()
  const levitateTimeRef = useRef(0)
  const [wireframeHand, setWireframeHand] = useState(null)
  
  // Remove default speed, only use drag-based rotation
  const rotationSpeed = useRef(0)
  const isDragging = useRef(false)
  const previousMouseX = useRef(0)
  const momentum = useRef(0)

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (document.body.dataset.activeSection !== 'home') return
      isDragging.current = true
      previousMouseX.current = e.clientX
      momentum.current = rotationSpeed.current // Keep existing momentum instead of resetting
    }

    const handleMouseMove = (e) => {
      if (document.body.dataset.activeSection !== 'home') return
      if (!isDragging.current) return
      
      const deltaX = e.clientX - previousMouseX.current
      // Accumulate drag into angular velocity for a lively flick, clamped so a
      // fast drag can't run away into an erratic spin.
      rotationSpeed.current = THREE.MathUtils.clamp(
        rotationSpeed.current + deltaX * 0.02,
        -6,
        6,
      )
      momentum.current = rotationSpeed.current
      previousMouseX.current = e.clientX
    }

    const handleMouseUp = () => {
      isDragging.current = false
      // Keep the accumulated momentum
      rotationSpeed.current = momentum.current
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseUp)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseUp)
    }
  }, [])

  // Build geometry + materials + centering ONCE per model load. Centering must
  // never re-run while the hand is rotated: a bounding box measured in a rotated
  // frame yields a wrong center and the model jumps out of place (the toggle bug).
  useEffect(() => {
    if (!gltf.scene) return

    // Solid body material on the original scene.
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.45 })
        child.castShadow = true
      }
    })

    // Wireframe overlay clone.
    const clone = gltf.scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true })
        child.castShadow = true
      }
    })

    setWireframeHand(clone)
  }, [gltf])

  // Center the model so it spins in place. Runs after the wireframe clone is set
  // (both mounted). Crucially we reset every transform that influences the world
  // bounding box BEFORE measuring, so the computed center is identical on every
  // run (StrictMode / re-mounts) instead of drifting off-axis. Because the clone
  // is built once, this no longer re-runs on a theme toggle either.
  useEffect(() => {
    if (!gltf.scene || !wireframeHand) return
    // Intrinsic centre, measured parent/scale-free so it's identical on every run.
    // Offsetting both models by -centre puts the model's centre at the rotation
    // group's origin, so rotating that group spins it perfectly in place — and the
    // size (group scale) is fully decoupled from where the hand sits on screen.
    const temp = gltf.scene.clone()
    temp.position.set(0, 0, 0)
    temp.rotation.set(0, 0, 0)
    temp.scale.set(1, 1, 1)
    temp.updateMatrixWorld(true)
    const center = new THREE.Box3().setFromObject(temp).getCenter(new THREE.Vector3())
    gltf.scene.position.set(-center.x, -center.y, -center.z)
    wireframeHand.position.set(-center.x, -center.y, -center.z)
  }, [gltf, wireframeHand])

  // Update materials per theme — mutate in place so geometry/centering/rotation
  // are never disturbed (rebuilding them is what knocked the spin out of place).
  useEffect(() => {
    if (gltf.scene) {
      // Solid faces only matter in light (white papercraft hand). In dark we
      // simply don't render the solid primitive at all → a hollow wireframe.
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.color.set(0xffffff)
          child.material.emissive.set(0xff0000)
          child.material.emissiveIntensity = 0.3
          child.material.metalness = 0.5
          child.material.roughness = 0.5
          child.material.needsUpdate = true
        }
      })
    }
    if (wireframeHand) {
      wireframeHand.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.color.set(isDark ? 0xc44dff : 0xffffff)
          child.material.opacity = isDark ? 0.88 : 0.5
          child.material.toneMapped = !isDark
          child.material.needsUpdate = true
        }
      })
    }
  }, [gltf, isDark, wireframeHand])

  useFrame((state, delta) => {
    if (handGroupRef.current && rotationRef.current) {
      levitateTimeRef.current += delta * 0.5
      const floatOffset = Math.sin(levitateTimeRef.current) * 0.1

      handGroupRef.current.position.y = HAND_POS[1] + floatOffset

      // Apply momentum with gentle decay
      if (!isDragging.current && Math.abs(rotationSpeed.current) > 0.001) {
        rotationSpeed.current *= 0.975
      } else if (!isDragging.current) {
        rotationSpeed.current = 0
      }

      rotationRef.current.rotation.y += rotationSpeed.current * delta
    }
  })

  if (!wireframeHand) return null

  return (
    <group ref={handGroupRef} position={HAND_POS}>
      <group ref={rotationRef} scale={HAND_SCALE}>
        {!isDark && <primitive object={gltf.scene} />}
        <primitive object={wireframeHand} />
      </group>
    </group>
  )
}

const WireframeHand = () => {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const isDark = theme === 'dark'
  // In dark the canvas is transparent so the shared galaxy shows through.
  const textColor = isDark ? '#f4f1eb' : '#000000'

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: isDark ? 'transparent' : '#F4F1EB',
      position: 'relative',
      overflow: 'visible'
    }}>
      <Canvas
        className="hero-canvas"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          touchAction: 'none',
          cursor: 'grab'
        }}
        shadows
        dpr={isMobile ? 0.45 : isDark ? 0.6 : [1, 2]}
        camera={{
          position: [0, 0, 9],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
      >
        {!isDark && <color attach="background" args={['#F4F1EB']} />}

        {/* Adjusted light position and intensity */}
        <directionalLight
          position={[2, 8, 6]}  // Adjusted position
          intensity={1}           // Increased intensity
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <ambientLight intensity={0.4} /> {/* Reduced ambient light */}

        <HandModel isDark={isDark} />
        <RedCircleWithText color={textColor} glow={isDark} />
      </Canvas>
    </div>
  )
}

export default WireframeHand 