import { useMemo, useLayoutEffect } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

function CameraRig() {
  const { camera } = useThree()

  useLayoutEffect(() => {
    camera.position.set(3, 2, 8)
    camera.fov = 45
    camera.lookAt(-3.4, 4, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

function TowerModel() {
  const gltf = useLoader(GLTFLoader, '/models/satellite_tower.glb')

  const fittedObject = useMemo(() => {
    const main = gltf.scene.clone(true)
    const wire = gltf.scene.clone(true)

    main.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xd9d5cf,
          roughness: 0.55,
          metalness: 0.2,
          emissive: new THREE.Color('#EC3107'),
          emissiveIntensity: 0.25,
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    wire.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: 0xffffff,
          transparent: true,
          opacity: 0.3,
        })
      }
    })

    const centered = new THREE.Group()
    centered.add(main)
    centered.add(wire)

    const box = new THREE.Box3().setFromObject(centered)
    const center = box.getCenter(new THREE.Vector3())
    centered.position.set(-center.x, -center.y, -center.z)

    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const autoScale = 6 / maxDim

    const fitted = new THREE.Group()
    fitted.add(centered)
    fitted.scale.setScalar(autoScale)

    return fitted
  }, [gltf])

  return (
    <group position={[-5, 4, 0]} scale={0.1}>
      <primitive object={fittedObject} />
    </group>
  )
}

export default function WireframeTower() {
  return (
    <Canvas
      camera={{ position: [3, 2, 8], fov: 45, near: 0.1, far: 200 }}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{ alpha: true }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <CameraRig />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 4, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      <pointLight position={[-3, -1, 4]} intensity={0.5} color="#EC3107" />
      <TowerModel />
    </Canvas>
  )
}
