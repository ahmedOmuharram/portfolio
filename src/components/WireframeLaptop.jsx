import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// Move the camera position array outside both components
const cameraPositionArray = [0, 0, 4.5]

function LaptopModel() {
  const gltf = useLoader(GLTFLoader, '/models/desk.glb')
  const laptopRef = useRef()
  const screenTextRef = useRef()
  const [cameraFocused, setCameraFocused] = useState(false)
  const [secondTextFocused, setSecondTextFocused] = useState(false)
  const [textNumber, setTextNumber] = useState(1)

  const mainScene = useMemo(() => {
    const scene = gltf.scene.clone()
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xD9D5CF,
          roughness: 0.6,
          metalness: 0.2,
          emissive: new THREE.Color('#EC3107'),
          emissiveIntensity: 0.08,
        })
        child.castShadow = true
        child.renderOrder = 1
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
          opacity: 0.28,
        })
        child.renderOrder = 2
      }
    })
    return scene
  }, [gltf])
  
  const cameraPosition = new THREE.Vector3(...cameraPositionArray)

  // This component will handle camera animation
  const { camera } = useThree()
  
  // Store original camera position for returning
  const originalCameraPosition = useRef(new THREE.Vector3(...cameraPositionArray))
  const originalCameraRotation = useRef(new THREE.Vector3(0, 0, 0))
  
  // Target positions for camera movement and looking
  const textPosition = new THREE.Vector3(-15, 0, -20)
  const textFocusPosition = new THREE.Vector3(0, 0, 4.2)
  
  // Second text target positions
  const secondTextPosition = new THREE.Vector3(8, 0, -20)
  const secondTextFocusPosition = new THREE.Vector3(-0.1, 0, 4.2)
  
  // Current look-at target for smooth transitions
  const currentLookAt = useRef(new THREE.Vector3(-0.5, 0.2, -3))
  
  // Handle camera animation with slower lerp for smoother transition
  useFrame(() => {
    // Update camera position and look-at target as before.
    if (cameraFocused) {
      camera.position.lerp(textFocusPosition, 0.02);
      currentLookAt.current.lerp(textPosition, 0.02);
    } else if (secondTextFocused) {
      camera.position.lerp(secondTextFocusPosition, 0.02);
      currentLookAt.current.lerp(secondTextPosition, 0.02);
    } else {
      camera.position.lerp(cameraPosition, 0.02);
      currentLookAt.current.lerp(new THREE.Vector3(-0.5, 0.2, -3), 0.02);
    }
    
    // Compute the target quaternion from the current position and the interpolated look-at target.
    const m = new THREE.Matrix4();
    m.lookAt(camera.position, currentLookAt.current, camera.up);
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(m);
    
    // Slerp the camera's quaternion toward the target quaternion.
    camera.quaternion.slerp(targetQuaternion, 0.1);
  });
  
  useEffect(() => {
    // Save initial camera position
    originalCameraPosition.current.copy(camera.position);
    originalCameraRotation.current.copy(camera.rotation);
    // Initialize look-at target
    currentLookAt.current.set(-0.5, 0.2, -3);

    // Handle Escape key to exit focused view
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && (cameraFocused || secondTextFocused)) {
        setCameraFocused(false);
        setSecondTextFocused(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cameraFocused, secondTextFocused, camera])

  // Update the click handlers to disable the other text when one is focused
  const handleBiographyClick = () => {
    setCameraFocused(prev => !prev);
    setSecondTextFocused(false); // Disable second text when biography is clicked
  };

  const handleSectionClick = () => {
    setSecondTextFocused(prev => !prev);
    setCameraFocused(false); // Disable biography when second text is clicked
  };

  return (
    <group ref={laptopRef} 
        position={[-0.5, 0.2, -3]} 
        scale={1}
        rotation={[0.25, Math.PI, 0]}
    >
      <primitive object={mainScene} />
      <primitive object={wireframeScene} />
      
      {/* Second text with clickable area */}
      <mesh
        position={[-0.55, 1.5, -6.48]}
        rotation={[0.0, Math.PI - 0.32, 0]}
        onClick={handleSectionClick}
      >
        <planeGeometry args={[0.55, 0.34]} />
        <meshBasicMaterial transparent opacity={0} color="#FF0000" />
      </mesh>
      
      {secondTextFocused ? (
        <Text
        position={[-0.55, 1.5, -6.48]}
        rotation={[-0.02, Math.PI - 0.31, 0]}
          fontSize={0.015}
          color="#CCCCCC"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.5}
          renderOrder={2}
          depthTest={false}
          font="/fonts/SpaceMono-Regular.ttf"
        >
          This is another section of text that appears when clicked.
          It demonstrates the same smooth camera transition effect.
          (Press ESC to return)
        </Text>
      ) : (
        <Text
        position={[-0.52, 1.5, -6.48]}
        rotation={[0.0, Math.PI - 0.31, 0]}
          fontSize={0.025}
          color="#CCCCCC"
          anchorX="center"
          anchorY="middle"
          maxWidth={1}
          renderOrder={2}
          depthTest={false}
          font="/fonts/SpaceMono-Regular.ttf"
        >
          View Section
        </Text>
      )}

      {/* Existing biography text and clickable area */}
      <mesh
        position={[-0.03, 1.5, -6.46]}
        rotation={[-0.008, Math.PI + 0.31, 0]}
        onClick={handleBiographyClick}
      >
        <planeGeometry args={[0.55, 0.34]} />
        <meshBasicMaterial transparent opacity={0} color="#FF0000" />
      </mesh>

      {cameraFocused && (
        <Text
          position={[-0.03, 1.58, -6.47]}
          rotation={[0.02, Math.PI + 0.31, 0]}
          fontSize={0.015}
          color="#CCCCCC"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.5}
          renderOrder={2}
          depthTest={false}
          font="/fonts/SpaceMono-Regular.ttf"
        >
          Hi, I am Ahmed Muharram, a junior student at the University of Pennsylvania, 
          concurrently pursuing Bachelor's and Master's degrees in computer science.
          I have explored various fields including full-stack applications, 
          machine learning, and game development.
          (Press ESC to return)
        </Text>
      )}
      {!cameraFocused && (
        <Text
          position={[-0.03, 1.5, -6.47]}
          rotation={[0.02, Math.PI + 0.31, 0]}
          fontSize={0.025}
          color="#CCCCCC"
          anchorX="center"
          anchorY="middle"
          maxWidth={1}
          renderOrder={2}
          depthTest={false}
          font="/fonts/SpaceMono-Regular.ttf"
        >
          View Biography
        </Text>
      )}
    </group>
  )
}

const WireframeLaptop = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'absolute',
      right: 0,
      top: 0
    }}>
      <Canvas
        camera={{
          position: cameraPositionArray,
          fov: 50
        }}
        style={{
          background: 'transparent'
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[12, 50, 3]} intensity={2} color="#FFFFFF" />
        <LaptopModel />
      </Canvas>
    </div>
  )
}

export default WireframeLaptop 