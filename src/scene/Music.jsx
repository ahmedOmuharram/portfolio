import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { CanvasTexture, ExtrudeGeometry, MeshStandardMaterial, Shape, SRGBColorSpace } from 'three'
import { useMaterials } from './materials'
import { Block, Segment } from './parts'
import { vinylLabelTexture, woodTexture } from './textures'
import { ui } from '../lib/store'
import { useLive } from './live'
import { toggleRadio } from '../lib/radio'
import { strum } from '../lib/audio'
import Hotspot from './Hotspot'
import { CREDENZA } from './layout'

function coverTexture(seed, a, b, c) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 256
  const g = cv.getContext('2d')
  g.fillStyle = a
  g.fillRect(0, 0, 256, 256)
  if (seed === 0) {
    g.fillStyle = b
    g.beginPath()
    g.arc(128, 150, 70, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = c
    g.fillRect(0, 200, 256, 56)
  } else if (seed === 1) {
    for (let i = 0; i < 7; i++) {
      g.fillStyle = i % 2 ? b : c
      g.fillRect(20 + i * 32, 40, 18, 176)
    }
  } else {
    g.strokeStyle = b
    g.lineWidth = 10
    for (let i = 0; i < 5; i++) {
      g.beginPath()
      g.arc(128, 128, 20 + i * 22, 0, Math.PI * 2)
      g.stroke()
    }
    g.fillStyle = c
    g.font = 'italic 600 28px Georgia, serif'
    g.fillText('blue', 24, 236)
  }
  const t = new CanvasTexture(cv)
  t.colorSpace = SRGBColorSpace
  return t
}

function Credenza() {
  const m = useMaterials()
  const { x, z, length, depth, height } = CREDENZA
  const cane = useMemo(() => new MeshStandardMaterial({ map: woodTexture(17, [150, 108, 64]), roughness: 0.8 }), [])
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[depth, height - 0.12, length]} radius={0.015} position={[0, 0.12 + (height - 0.12) / 2, 0]} material={m.woodDark} castShadow receiveShadow />
      {[-1, 1].map((s) => (
        <Block key={s} size={[0.01, height - 0.2, length / 2 - 0.04]} position={[-depth / 2 - 0.002, 0.12 + (height - 0.12) / 2, s * (length / 4)]} material={cane} cast={false} />
      ))}
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Segment key={i} a={[sx * (depth / 2 - 0.05), 0.12, sz * (length / 2 - 0.08)]} b={[sx * (depth / 2 - 0.03), 0, sz * (length / 2 - 0.05)]} radius={0.014} material={m.woodDark} />
      ))}
    </group>
  )
}

function Turntable() {
  const m = useMaterials()
  const vinyl = useRef()
  const arm = useRef()
  const label = useMemo(() => vinylLabelTexture(), [])
  const speed = useRef(0)
  const { x, z, height } = CREDENZA
  useFrame((_, dt) => {
    const on = ui.get().radio
    speed.current += ((on ? 3.49 : 0) - speed.current) * Math.min(1, dt * 1.5)
    vinyl.current.rotation.y -= speed.current * dt
    arm.current.rotation.y += ((on ? 0.42 : 0) - arm.current.rotation.y) * Math.min(1, dt * 2)
  })
  return (
    <Hotspot id="radio" action={toggleRadio} position={[x - 0.02, height, z - 0.23]}>
      <RoundedBox args={[0.34, 0.08, 0.42]} radius={0.012} position={[0, 0.04, 0]} material={m.wood} castShadow receiveShadow />
      <mesh position={[0, 0.088, 0.03]} material={m.steel}>
        <cylinderGeometry args={[0.15, 0.15, 0.014, 48]} />
      </mesh>
      <group ref={vinyl} position={[0, 0.097, 0.03]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.148, 64]} />
          <meshStandardMaterial map={label} roughness={0.25} metalness={0.2} />
        </mesh>
      </group>
      <group position={[0.11, 0.1, -0.15]}>
        <mesh material={m.steel}>
          <cylinderGeometry args={[0.018, 0.022, 0.03, 20]} />
        </mesh>
        <group ref={arm}>
          <Segment a={[0, 0.02, 0]} b={[-0.04, 0.02, 0.2]} radius={0.004} material={m.brass} />
          <Block size={[0.02, 0.012, 0.035]} position={[-0.045, 0.016, 0.215]} material={m.black} />
        </group>
      </group>
      <Block size={[0.04, 0.01, 0.02]} position={[0.12, 0.085, 0.17]} material={m.brass} cast={false} />
    </Hotspot>
  )
}

function TableLamp({ position }) {
  const live = useLive()
  const shade = useMemo(() => new MeshStandardMaterial({ color: '#e9cfa3', roughness: 0.9, emissive: '#ffb066', emissiveIntensity: 0 }), [])
  const light = useRef()
  const bulb = useRef()
  useFrame(() => {
    shade.emissiveIntensity = 0.2 + live.lamps * 1.4
    light.current.intensity = 0.6 + live.lamps * 4.5
    bulb.current.color.setRGB(1, 0.78, 0.5).multiplyScalar(1 + live.lamps * 4)
  })
  const m = useMaterials()
  return (
    <group position={position}>
      <mesh position={[0, 0.03, 0]} material={m.ceramic} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.06, 28]} />
      </mesh>
      <Segment a={[0, 0.05, 0]} b={[0, 0.28, 0]} radius={0.01} material={m.brass} />
      <mesh position={[0, 0.33, 0]} material={shade} castShadow>
        <sphereGeometry args={[0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.03, 12, 10]} />
        <meshBasicMaterial ref={bulb} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[-0.06, 0.26, 0]} color="#ffad62" distance={4.5} decay={2} />
    </group>
  )
}

function Speaker({ position }) {
  const m = useMaterials()
  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[0.16, 0.24, 0.16]} radius={0.008} position={[0, 0.12, 0]} material={m.wood} castShadow receiveShadow />
      <mesh position={[0, 0.09, 0.081]} material={m.black}>
        <circleGeometry args={[0.05, 28]} />
      </mesh>
      <mesh position={[0, 0.18, 0.081]} material={m.black}>
        <circleGeometry args={[0.018, 20]} />
      </mesh>
    </group>
  )
}

function Sleeves() {
  const covers = useMemo(
    () => [
      coverTexture(0, '#203046', '#e3a35a', '#9b3e2e'),
      coverTexture(1, '#d9cdb6', '#2a3d33', '#b5523b'),
      coverTexture(2, '#1c2a44', '#6b8fbf', '#e9e2d6'),
    ],
    [],
  )
  const { x, z } = CREDENZA
  const m = useMaterials()
  const crate = m.woodLight
  return (
    <group position={[x + 0.02, 0, z + 1.02]}>
      <Block size={[0.34, 0.2, 0.36]} position={[0, 0.1, 0]} material={crate} />
      {covers.map((map, i) => (
        <mesh key={i} position={[0, 0.2, -0.1 + i * 0.07]} rotation={[-0.22 + i * 0.05, 0, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.006]} />
          <meshStandardMaterial attach="material-0" color="#222" />
          <meshStandardMaterial attach="material-1" color="#222" />
          <meshStandardMaterial attach="material-2" color="#222" />
          <meshStandardMaterial attach="material-3" color="#222" />
          <meshStandardMaterial attach="material-4" map={map} roughness={0.7} />
          <meshStandardMaterial attach="material-5" color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  )
}

function guitarShape() {
  const s = new Shape()
  s.moveTo(0, -0.25)
  s.bezierCurveTo(0.12, -0.25, 0.2, -0.18, 0.2, -0.07)
  s.bezierCurveTo(0.2, 0.02, 0.12, 0.03, 0.115, 0.07)
  s.bezierCurveTo(0.11, 0.12, 0.16, 0.14, 0.155, 0.2)
  s.bezierCurveTo(0.15, 0.26, 0.08, 0.28, 0, 0.28)
  s.bezierCurveTo(-0.08, 0.28, -0.15, 0.26, -0.155, 0.2)
  s.bezierCurveTo(-0.16, 0.14, -0.11, 0.12, -0.115, 0.07)
  s.bezierCurveTo(-0.12, 0.03, -0.2, 0.02, -0.2, -0.07)
  s.bezierCurveTo(-0.2, -0.18, -0.12, -0.25, 0, -0.25)
  return s
}

function Guitar() {
  const m = useMaterials()
  const group = useRef()
  const strings = useRef([])
  const last = useRef(0)
  const kick = useRef(0)
  const body = useMemo(() => new ExtrudeGeometry(guitarShape(), { depth: 0.085, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3, curveSegments: 36 }), [])
  const top = useMemo(() => new MeshStandardMaterial({ map: woodTexture(23, [196, 150, 96]), roughness: 0.35 }), [])
  const sides = useMemo(() => new MeshStandardMaterial({ map: woodTexture(29, [92, 52, 30]), roughness: 0.4 }), [])
  useFrame((_, dt) => {
    const s = ui.get().strum
    if (s !== last.current) {
      last.current = s
      kick.current = 1
    }
    kick.current = Math.max(0, kick.current - dt * 0.9)
    const k = kick.current
    const t = performance.now() / 1000
    group.current.rotation.z = Math.sin(t * 9) * 0.012 * k
    strings.current.forEach((st, i) => {
      if (st) st.scale.x = st.scale.z = 1 + Math.abs(Math.sin(t * (60 + i * 7))) * 2.5 * k
    })
  })
  return (
    <Hotspot id="guitar" action={strum} position={[3.1, 0, 0.12]} rotation={[0, -Math.PI / 2 - 0.25, 0]}>
      <group ref={group} position={[0, 0.06, -0.06]} rotation={[-0.2, 0, 0]}>
        <mesh geometry={body} material={[top, sides]} position={[0, 0.33, 0]} castShadow receiveShadow />
        <mesh position={[0, 0.42, 0.093]}>
          <circleGeometry args={[0.045, 32]} />
          <meshStandardMaterial color="#0b0806" roughness={1} />
        </mesh>
        <mesh position={[0, 0.42, 0.0925]}>
          <ringGeometry args={[0.05, 0.058, 40]} />
          <meshStandardMaterial color="#2a1a10" roughness={0.6} />
        </mesh>
        <Block size={[0.11, 0.018, 0.012]} position={[0, 0.2, 0.096]} material={m.woodDark} />
        <Block size={[0.05, 0.46, 0.028]} position={[0, 0.83, 0.06]} material={sides} />
        <Block size={[0.046, 0.46, 0.006]} position={[0, 0.83, 0.077]} material={m.woodDark} />
        <Block size={[0.07, 0.16, 0.02]} position={[0, 1.13, 0.05]} rotation={[0.18, 0, 0]} material={m.woodDark} />
        {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((o, i) => (
          <group key={o} ref={(el) => (strings.current[i] = el)}>
            <Segment a={[o * 0.0075, 0.2, 0.1]} b={[o * 0.0065, 1.06, 0.082]} radius={0.0007} material={m.brass} radialSegments={3} cast={false} />
          </group>
        ))}
      </group>
      <Segment a={[0, 0.22, 0.03]} b={[0, 0.02, -0.2]} radius={0.01} material={m.steel} />
      <Segment a={[-0.12, 0.25, 0.03]} b={[0.12, 0.25, 0.03]} radius={0.01} material={m.steel} />
      <Segment a={[0, 0.25, 0.03]} b={[0, 0.72, -0.12]} radius={0.01} material={m.steel} />
      {[-1, 1].map((s) => (
        <Segment key={s} a={[s * 0.12, 0.25, 0.03]} b={[s * 0.18, 0, 0.12]} radius={0.01} material={m.steel} />
      ))}
    </Hotspot>
  )
}

export default function Music() {
  const { x, z, height } = CREDENZA
  return (
    <group>
      <Credenza />
      <Turntable />
      <Speaker position={[x - 0.02, height, z - 0.6]} />
      <Speaker position={[x - 0.02, height, z + 0.17]} />
      <TableLamp position={[x - 0.02, height, z + 0.55]} />
      <Sleeves />
      <Guitar />
    </group>
  )
}
