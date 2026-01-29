import React, { useRef, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls, SoftShadows, Text } from '@react-three/drei'
import * as THREE from 'three'

// Updated CircleBackdrop with centered positioning
function CircleBackdrop() {
  return (
    <group>
      {/* Red circle - centered */}
      <mesh position={[4, -1.7, 4]} receiveShadow>
        <circleGeometry args={[1.5, 5]} />
        <meshStandardMaterial 
          color="#EC3107"
          roughness={0.1}
          metalness={0.7}
        />
      </mesh>
    </group>
  )
}

function Model() {
  const modelRef = useRef(null)
  const wireframeRef = useRef(null)
  const [model, setModel] = useState(null)
  const [wireframe, setWireframe] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loader = new GLTFLoader()
    loader.load(
      '/models/envelops.glb',
      (gltf) => {
        // Main model with matching colors
        const mainModel = gltf.scene.clone()
        mainModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.material = new THREE.MeshStandardMaterial({
              color: 0xAAAAAA,
              emissive: new THREE.Color("#EC3107"),  // Brand red color
              emissiveIntensity: 0.4,
              metalness: 0.3,
              roughness: 0.7
            });
          }
        });
        setModel(mainModel)
        
        // Wireframe overlay 
        const wireframeModel = gltf.scene.clone()
        wireframeModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false
            child.material = new THREE.MeshBasicMaterial({
              color: 0xFFFFFF,  // Pure white wireframe
              wireframe: true,
              transparent: true,
              opacity: 0.15     // More subtle wireframe
            });
            child.scale.multiplyScalar(1.005);
          }
        });
        setWireframe(wireframeModel)
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error)
        setError(error)
      }
    )
  }, [])

  // Animation frame for both the model and wireframe
  useFrame((state) => {
    if (modelRef.current && wireframeRef.current) {
      const t = state.clock.getElapsedTime()
      
      // Sync rotations between main model and wireframe
      const rotY = 1.8 + Math.sin(t / 4) / 4
      const rotX = 0.2 + Math.sin(t / 4) / 8
    
      modelRef.current.rotation.y = rotY
      modelRef.current.rotation.x = rotX
      
      wireframeRef.current.rotation.y = rotY
      wireframeRef.current.rotation.x = rotX
    }
  })

  if (error) return null
  if (!model || !wireframe) return null

  return (
    <>
      <primitive 
        ref={modelRef}
        object={model} 
        position={[2.5, -1.2, 5]}
        scale={0.7}
      />
      <primitive 
        ref={wireframeRef}
        object={wireframe} 
        position={[2.5, -1.2, 5]}
        scale={0.7}
      />
    </>
  )
}


export default function WireframeEnvelope() {
  return (
    <div className="wireframe-envelope" style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none'
    }}>
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        style={{ 
          background: '#F4F1EB',
          width: '100%',
          height: '100%'
        }}
        shadows={{ type: 'PCFSoftShadowMap' }}
      >
        <color attach="background" args={['#F4F1EB']} />
        <SoftShadows size={32} samples={24} focus={0} />
        
        {/* Add back subtle ambient light */}
        <ambientLight intensity={0.3} />
        
        {/* Fix directional light with proper shadow camera settings */}
        <directionalLight 
          position={[-8, 6, 12]} 
          intensity={2} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.0005}
        />
    
        <Suspense>
          <CircleBackdrop />
          <Model />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
} 