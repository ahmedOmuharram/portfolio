import { useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { useTheme } from '../ThemeProvider'
import { useIsMobile } from '../useIsMobile'

// ── Placement / camera knobs (edit + hot-reloads live) ──────────────────────
// The tower is re-centred in TowerModel (each clone is offset by -center), so its
// on-screen home is exactly TOWER_POS, and the camera's aim must stay consistent
// with it. The camera sits at x=3 but looks toward x=0 (CAM_LOOK) — angled ~20°
// left — which is what parks the tower over on the right. To push it further
// right, raise TOWER_POS[0] (or lower CAM_LOOK[0]); don't let them drift too far
// or it clips the right edge. (The old CAM_LOOK = [-3.4, 4, 0] aimed up and hard
// left, flinging the centred tower ~40° off-axis past the right edge — only a
// clipped sliver showed and it never looked like it was spinning.)
const TOWER_POS = [3, 1.5, 0]   // right of centre, fully in frame
const TOWER_SCALE = 1           // (transforms now actually apply, post-skeleton fix)
// The model is a flat parabolic dish: a full Y spin turns it edge-on twice per
// turn, so it vanishes ("flickering"). Instead pan it like a radar — it sweeps
// side to side but never goes fully edge-on. SWING = max angle (rad), SPIN = speed.
const TOWER_SWING = 0.3
const TOWER_SPIN = 0.5
const CAM_POS = [3, 2, 8]
const CAM_LOOK = [0, 2, 0]       // level; angled left of CAM_POS → tower sits right

function TowerModel({ isDark }) {
  const gltf = useLoader(GLTFLoader, '/models/satellite_tower.glb')
  const spinRef = useRef()
  const tRef = useRef(0)

  const { solid, wire, fit } = useMemo(() => {
    // satellite_tower.glb is RIGGED (a 3-bone skeleton). A plain .clone() leaves
    // each cloned SkinnedMesh bound to the ORIGINAL skeleton, so the clones render
    // at the model's original size/place and ignore our group position/scale/spin
    // entirely (materials still apply — that fooled us for ages). SkeletonUtils'
    // clone rebinds each clone to its own cloned bones, so group transforms work.
    const solid = cloneSkinned(gltf.scene)
    const wire = cloneSkinned(gltf.scene)

    const probe = gltf.scene.clone(true)
    probe.position.set(0, 0, 0)
    probe.rotation.set(0, 0, 0)
    probe.scale.set(1, 1, 1)
    probe.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(probe)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1

    for (const obj of [solid, wire]) {
      obj.position.set(-center.x, -center.y, -center.z)
      obj.rotation.set(0, 0, 0)
      obj.scale.set(1, 1, 1)
    }

    solid.traverse((c) => {
      if (c.isMesh) {
        c.material = new THREE.MeshStandardMaterial({
          color: 0xd9d5cf,
          roughness: 0.55,
          metalness: 0.2,
          emissive: new THREE.Color('#EC3107'),
          emissiveIntensity: 0.25,
        })
        c.castShadow = true
        c.receiveShadow = true
      }
    })
    wire.traverse((c) => {
      if (c.isMesh) {
        c.material = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true })
      }
    })

    return { solid, wire, fit: 6 / maxDim }
  }, [gltf])

  useEffect(() => {
    wire.traverse((c) => {
      if (c.isMesh && c.material) {
        c.material.color.set(isDark ? 0xc77bff : 0xffffff)
        c.material.opacity = isDark ? 0.5 : 0.3
        c.material.toneMapped = !isDark
        c.material.needsUpdate = true
      }
    })
  }, [isDark, wire])

  useFrame((_, dt) => {
    if (!spinRef.current) return
    tRef.current += dt
    spinRef.current.rotation.y = Math.sin(tRef.current * TOWER_SPIN) * TOWER_SWING
  })

  return (
    <group name="towerPos" position={TOWER_POS}>
      <group name="towerScale" ref={spinRef} scale={fit * TOWER_SCALE}>
        <primitive object={solid} visible={!isDark} dispose={null} />
        <primitive object={wire} dispose={null} />
      </group>
    </group>
  )
}

export default function WireframeTower({ active = false }) {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const isDark = theme === 'dark'

  // The canvas must be CREATED while Contact is on screen. A WebGL canvas first
  // composited inside a hidden deck layer keeps presenting that stale frame until
  // a repaint (the theme toggle) — even though the scene behind it is correct.
  // That stale-presentation is the whole "old tower on first dark load" bug.
  // Mounting only once Contact has been shown (and keeping it mounted) makes the
  // canvas composite live from birth, like the hero hand that never had the bug.
  // Mount the canvas only AFTER the deck's slide-in transition settles. A WebGL
  // canvas first composited while its .section is mid-transform (translateY) gets
  // snapshotted by the compositor and then presents that one frozen frame forever
  // — which showed the tower at its pre-scale size and made it look like nothing
  // (size/position/spin) ever updated. Mounting at rest composites it live, like
  // the hero hand. 760ms > the 720ms section transition.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!active) {
      setReady(false)
      return
    }
    const t = setTimeout(() => setReady(true), 760)
    return () => clearTimeout(t)
  }, [active])
  if (!ready) return null

  return (
    <Canvas
      className={`wireframe-tower-canvas${isDark ? ' is-dark' : ''}`}
      camera={{ position: CAM_POS, fov: 45, near: 0.1, far: 200 }}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={isMobile ? 0.45 : isDark ? 0.6 : [1, 2]}
      gl={{ alpha: true }}
      onCreated={(state) => {
        const { camera } = state
        camera.lookAt(CAM_LOOK[0], CAM_LOOK[1], CAM_LOOK[2])
        camera.updateProjectionMatrix()
        if (typeof window !== 'undefined') window.__r3f = state
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <ambientLight intensity={isDark ? 0.35 : 0.6} />
      <directionalLight
        position={[4, 4, 6]}
        intensity={isDark ? 0.7 : 1.2}
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
      <pointLight position={[-3, -1, 4]} intensity={0.6} color={isDark ? '#b94dff' : '#EC3107'} />
      <TowerModel isDark={isDark} />
    </Canvas>
  )
}
