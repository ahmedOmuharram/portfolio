import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { CylinderGeometry, DoubleSide, MeshStandardMaterial } from 'three'
import { useMaterials } from './materials'
import { Segment } from './parts'
import { ARMCHAIR, LAMPS } from './layout'
import { useLive } from './live'
import Hotspot from './Hotspot'
import { lampLevel, toggleLamp } from './lamps'

function Armchair() {
  const m = useMaterials()
  const velvet = useMemo(() => new MeshStandardMaterial({ color: '#6e3426', roughness: 0.92 }), [])
  const knit = useMemo(() => new MeshStandardMaterial({ color: '#cdbb98', roughness: 1, side: DoubleSide }), [])
  return (
    <group position={ARMCHAIR.position} rotation={[0, ARMCHAIR.rotation, 0]}>
      <RoundedBox args={[0.92, 0.22, 0.82]} radius={0.06} smoothness={4} position={[0, 0.3, 0]} material={velvet} castShadow receiveShadow />
      <RoundedBox args={[0.66, 0.14, 0.66]} radius={0.06} smoothness={4} position={[0, 0.47, 0.05]} material={velvet} castShadow receiveShadow />
      <RoundedBox args={[0.92, 0.62, 0.2]} radius={0.08} smoothness={4} position={[0, 0.66, -0.33]} rotation={[-0.14, 0, 0]} material={velvet} castShadow receiveShadow />
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.16, 0.26, 0.8]} radius={0.07} smoothness={4} position={[s * 0.4, 0.52, 0]} material={velvet} castShadow receiveShadow />
      ))}
      {[
        [-0.38, -0.32],
        [0.38, -0.32],
        [-0.38, 0.32],
        [0.38, 0.32],
      ].map(([x, z], i) => (
        <Segment key={i} a={[x, 0.2, z]} b={[x * 1.08, 0, z * 1.1]} radius={0.018} material={m.woodDark} />
      ))}
      <RoundedBox args={[0.2, 0.06, 0.62]} radius={0.025} smoothness={3} position={[-0.4, 0.68, 0.02]} rotation={[0, 0, 0.04]} material={knit} castShadow receiveShadow />
      <RoundedBox args={[0.035, 0.22, 0.58]} radius={0.015} smoothness={3} position={[-0.505, 0.57, 0.02]} rotation={[0, 0, 0.08]} material={knit} castShadow receiveShadow />
    </group>
  )
}

function FloorLamp() {
  const m = useMaterials()
  const live = useLive()
  const shade = useRef()
  const bulb = useRef()
  const [x, y, z] = LAMPS.floor.pos
  const shadeGeo = useMemo(() => new CylinderGeometry(0.17, 0.22, 0.28, 40, 1, true), [])
  const shadeMat = useMemo(() => new MeshStandardMaterial({ color: '#e8d9bc', roughness: 1, side: DoubleSide, emissive: '#ffb66b', emissiveIntensity: 0 }), [])
  useFrame(() => {
    const on = lampLevel('lampFloor')
    shadeMat.emissiveIntensity = on * (0.15 + live.lamps * 1.6)
    bulb.current.color.setRGB(1, 0.8, 0.55).multiplyScalar(0.12 + on * (0.9 + live.lamps * 6))
  })
  return (
    <Hotspot id="lampFloor" action={() => toggleLamp('lampFloor')}>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.3
        return <Segment key={i} a={[x, 1.0, z]} b={[x + Math.cos(a) * 0.26, 0, z + Math.sin(a) * 0.26]} radius={0.014} material={m.wood} />
      })}
      <Segment a={[x, 0.98, z]} b={[x, y - 0.1, z]} radius={0.012} material={m.brass} />
      <mesh ref={shade} geometry={shadeGeo} material={shadeMat} position={[x, y, z]} castShadow />
      <mesh ref={undefined} position={[x, y - 0.03, z]}>
        <sphereGeometry args={[0.04, 16, 12]} />
        <meshBasicMaterial ref={bulb} toneMapped={false} />
      </mesh>
    </Hotspot>
  )
}

function SideTable() {
  const m = useMaterials()
  return (
    <group position={[-1.48, 0, -2.3]}>
      <mesh position={[0, 0.52, 0]} material={m.woodDark} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.03, 40]} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return <Segment key={i} a={[0, 0.5, 0]} b={[Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17]} radius={0.012} material={m.steel} />
      })}
      <mesh position={[0.05, 0.56, 0.02]} rotation={[0, 0.4, 0]} castShadow material={m.fabricGreen}>
        <boxGeometry args={[0.15, 0.03, 0.21]} />
      </mesh>
      <mesh position={[0.04, 0.59, 0.01]} rotation={[0, 0.1, 0]} castShadow material={m.terracotta}>
        <boxGeometry args={[0.13, 0.025, 0.19]} />
      </mesh>
      <mesh position={[-0.1, 0.58, -0.06]} castShadow material={m.ceramic}>
        <cylinderGeometry args={[0.035, 0.035, 0.08, 20]} />
      </mesh>
    </group>
  )
}

export default function Corner() {
  return (
    <group>
      <Armchair />
      <FloorLamp />
      <SideTable />
    </group>
  )
}
