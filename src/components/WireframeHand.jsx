import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

function RedCircleWithText() {
  return (
    <group>
      {/* Text behind circle */}
      <Text
        position={[0, 0, 0.5]}
        fontSize={4}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        font="/fonts/StarlightRune.ttf"
      >
        MUHA   RRAM
      </Text>
    </group>
  )
}

function HandModel() {
  const gltf = useLoader(GLTFLoader, '/models/hand.glb')
  const wireframeMaterialRef = useRef()
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
      const speed = deltaX * 0.012  // Reduced from 0.05 to 0.012 (about 1/4)
      
      // Add to existing momentum instead of setting directly
      rotationSpeed.current += speed
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

  // Solid black hand
  useMemo(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          wireframe: false,
          color: 0xFFFFFF,
          roughness: 0.5,
          metalness: 0.5,
          emissive: 0xFF0000,
          emissiveIntensity: 0.3,
        })
        child.castShadow = true // Make hand cast shadows
      }
    })
  }, [gltf])

  // Create wireframe overlay
  useEffect(() => {
    if (!gltf.scene) return
    
    const clone = gltf.scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        const material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.5,
          emissive: 0x0000FF,
          emissiveIntensity: 2,
        })
        child.material = material
        child.castShadow = true
        wireframeMaterialRef.current = material
      }
    })
    setWireframeHand(clone)
  }, [gltf])

  // Setup center and positions after everything is loaded and mounted
  useEffect(() => {
    if (!gltf.scene || !wireframeHand || !rotationRef.current) return
    
    // Get bounding box of the hand model to find its center
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = box.getCenter(new THREE.Vector3())
    
    // Position the rotation pivot at the model's center
    rotationRef.current.position.copy(center)
    
    // Offset the models so their centers align with the rotation point
    gltf.scene.position.set(-center.x, -center.y, -center.z)
    wireframeHand.position.set(-center.x, -center.y, -center.z)
  }, [gltf, wireframeHand])

  useFrame((state, delta) => {
    if (handGroupRef.current && rotationRef.current) {
      levitateTimeRef.current += delta * 0.5
      const floatOffset = Math.sin(levitateTimeRef.current) * 0.1
      
      handGroupRef.current.position.y = -17.4 + floatOffset

      // Apply momentum with faster decay
      if (!isDragging.current && Math.abs(rotationSpeed.current) > 0.001) {
        rotationSpeed.current *= 0.992  // Increased decay from 0.996 to 0.992
      } else if (!isDragging.current) {
        rotationSpeed.current = 0
      }
      
      rotationRef.current.rotation.y += rotationSpeed.current * delta
    }
  })

  if (!wireframeHand) return null

  return (
    <group ref={handGroupRef} position={[4.4, -17.4, 6.5]}>
      <group ref={rotationRef}>
        <primitive object={gltf.scene} scale={10} />
        <primitive object={wireframeHand} scale={10} />
      </group>
    </group>
  )
}

const WireframeHand = () => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#F4F1EB',
      position: 'relative',
      overflow: 'visible'
    }}>
      <Canvas
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          touchAction: 'none',
          cursor: 'grab'
        }}
        shadows
        camera={{
          position: [0, 0, 9],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
      >
        <color attach="background" args={['#F4F1EB']} />
        
        {/* Adjusted light position and intensity */}
        <directionalLight
          position={[2, 8, 6]}  // Adjusted position
          intensity={1}           // Increased intensity
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <ambientLight intensity={0.4} /> {/* Reduced ambient light */}
        
        <HandModel />
        <RedCircleWithText />
      </Canvas>
    </div>
  )
}

export default WireframeHand 