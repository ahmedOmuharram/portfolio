import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, CapsuleGeometry, LatheGeometry, MeshStandardMaterial, Quaternion, SplineCurve, Vector2, Vector3 } from 'three'
import { ui } from '../lib/store'
import { petCat } from '../lib/audio'
import Hotspot from './Hotspot'
import { ARMCHAIR } from './layout'

const up = new Vector3(0, 1, 0)

function furMaterial(color, stripes) {
  let map = null
  if (stripes) {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 128
    const g = c.getContext('2d')
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 256, 128)
    g.fillStyle = 'rgba(90,40,10,0.35)'
    for (let i = 0; i < 14; i++) {
      g.beginPath()
      const x = i * 19 + 4
      g.moveTo(x, 0)
      g.quadraticCurveTo(x + 8, 64, x - 2, 128)
      g.lineTo(x + 6, 128)
      g.quadraticCurveTo(x + 14, 64, x + 7, 0)
      g.fill()
    }
    map = new CanvasTexture(c)
  }
  return new MeshStandardMaterial({ color, roughness: 0.85, map })
}

function Tail({ material, points, radius = 0.018 }) {
  const segs = useRef([])
  const geo = useMemo(() => new CapsuleGeometry(1, 1, 4, 10), [])
  const q = useMemo(() => new Quaternion(), [])
  const dir = useMemo(() => new Vector3(), [])
  useFrame(() => {
    const pts = points.current
    for (let i = 0; i < pts.length - 1; i++) {
      const s = segs.current[i]
      if (!s) continue
      const a = pts[i]
      const b = pts[i + 1]
      dir.copy(b).sub(a)
      const len = dir.length()
      q.setFromUnitVectors(up, dir.normalize())
      s.position.copy(a).add(b).multiplyScalar(0.5)
      s.quaternion.copy(q)
      const r = radius * (1 - (i / pts.length) * 0.45)
      s.scale.set(r, Math.max(0.0001, (len + 2 * r) / 3), r)
    }
  })
  return (
    <group>
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} ref={(el) => (segs.current[i] = el)} geometry={geo} material={material} castShadow />
      ))}
    </group>
  )
}

function Ears({ material, y, z, spread = 0.036, inner = '#c98f7a' }) {
  const innerMat = useMemo(() => new MeshStandardMaterial({ color: inner, roughness: 0.9 }), [inner])
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * spread, y, z]} rotation={[0.1, 0, -s * 0.3]}>
          <mesh material={material} castShadow>
            <coneGeometry args={[0.027, 0.06, 16]} />
          </mesh>
          <mesh material={innerMat} position={[0, -0.004, -0.009]} scale={[0.6, 0.75, 0.4]}>
            <coneGeometry args={[0.027, 0.06, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function catBody() {
  const pts = [
    [0, 0],
    [0.07, 0.004],
    [0.1, 0.02],
    [0.112, 0.055],
    [0.108, 0.095],
    [0.094, 0.135],
    [0.074, 0.175],
    [0.058, 0.215],
    [0.05, 0.25],
    [0.046, 0.275],
    [0.03, 0.29],
    [0, 0.295],
  ].map(([x, y]) => new Vector2(x, y))
  return new LatheGeometry(new SplineCurve(pts).getPoints(48), 40)
}

function SillCat() {
  const fur = useMemo(() => furMaterial('#34302d', false), [])
  const body = useMemo(() => catBody(), [])
  const torso = useRef()
  const head = useRef()
  const last = useRef(0)
  const react = useRef(0)
  const annoyed = useRef(0)
  const tailPts = useRef(Array.from({ length: 12 }, () => new Vector3()))
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const p = ui.get().pet
    if (p && p.n !== last.current) {
      last.current = p.n
      if (p.id === 'sill' && p.kind === 'annoyed') annoyed.current = 1
      else if (p.id === 'sill' && p.kind !== 'ignore') react.current = 1
    }
    react.current = Math.max(0, react.current - dt * 0.4)
    annoyed.current = Math.max(0, annoyed.current - dt * 0.22)
    torso.current.scale.set(1 + Math.sin(t * 1.6) * 0.012, 1 + Math.sin(t * 1.6) * 0.018, 1)
    head.current.rotation.y = Math.sin(t * 0.23) * 0.35 + Math.sin(t * 2.1) * 0.02 + react.current * Math.sin(t * 3) * 0.2 + annoyed.current * 0.9
    head.current.rotation.x = -0.12 + Math.sin(t * 0.31) * 0.06 - react.current * 0.25
    const pts = tailPts.current
    const swish = (Math.sin(t * 1.2) * 0.5 + Math.sin(t * 0.37) * 0.3) * (1 + annoyed.current * 1.6) + annoyed.current * Math.sin(t * 7) * 0.5
    for (let i = 0; i < pts.length; i++) {
      const k = i / (pts.length - 1)
      const overEdge = Math.max(0, k - 0.3) / 0.7
      pts[i].set(
        0.06 + k * 0.05 + Math.sin(k * 3 + t * 1.2) * 0.02 * k + swish * 0.06 * overEdge * overEdge,
        0.03 - overEdge * overEdge * 0.26 + Math.sin(k * 2) * 0.01,
        0.08 + Math.min(k, 0.3) * 0.5 + overEdge * 0.03,
      )
    }
  })
  return (
    <Hotspot id="catSill" action={() => petCat('sill')} position={[-1.02, 0.83, -2.9]} rotation={[0, 0.25, 0]} scale={1.3}>
      <group ref={torso} scale={[1, 1, 1]}>
        <mesh geometry={body} material={fur} scale={[1, 1, 0.86]} rotation={[0.08, 0, 0]} castShadow receiveShadow />
      </group>
      {[-1, 1].map((s) => (
        <mesh key={s} material={fur} position={[s * 0.075, 0.055, 0.035]} rotation={[0.3, 0, s * 0.25]} scale={[0.05, 0.06, 0.085]} castShadow>
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`p${s}`} material={fur} position={[s * 0.032, 0.015, -0.085]} scale={[0.022, 0.016, 0.03]} castShadow>
          <sphereGeometry args={[1, 14, 10]} />
        </mesh>
      ))}
      <group ref={head} position={[0, 0.315, -0.02]}>
        <mesh material={fur} scale={[0.062, 0.054, 0.058]} castShadow>
          <sphereGeometry args={[1, 32, 24]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={fur} position={[s * 0.034, -0.016, -0.012]} scale={[0.032, 0.028, 0.034]}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        ))}
        <mesh material={fur} position={[0, -0.02, -0.048]} scale={[0.026, 0.02, 0.022]}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
        <Ears material={fur} y={0.046} z={0.002} spread={0.034} />
      </group>
      <Tail material={fur} points={tailPts} radius={0.017} />
    </Hotspot>
  )
}

function CurledCat() {
  const fur = useMemo(() => furMaterial('#c47a3c', true), [])
  const belly = useMemo(() => new MeshStandardMaterial({ color: '#e7c9a2', roughness: 0.9 }), [])
  const body = useRef()
  const head = useRef()
  const last = useRef(0)
  const react = useRef(0)
  const annoyed = useRef(0)
  const tailPts = useRef(Array.from({ length: 12 }, () => new Vector3()))
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const p = ui.get().pet
    if (p && p.n !== last.current) {
      last.current = p.n
      if (p.id === 'cat' && p.kind === 'annoyed') annoyed.current = 1
      else if (p.id === 'cat' && p.kind !== 'ignore') react.current = 1
    }
    react.current = Math.max(0, react.current - dt * 0.35)
    annoyed.current = Math.max(0, annoyed.current - dt * 0.22)
    const breath = Math.sin(t * 1.3)
    body.current.scale.set(1 + breath * 0.012, 1 + breath * 0.035, 1 + breath * 0.012)
    head.current.rotation.x = -react.current * 0.6
    head.current.position.y = 0.075 + react.current * 0.05
    const pts = tailPts.current
    const flick = Math.sin(t * 0.8) * 0.15 * (0.5 + 0.5 * Math.sin(t * 0.21)) + Math.sin(t * 9) * 0.35 * annoyed.current
    for (let i = 0; i < pts.length; i++) {
      const k = i / (pts.length - 1)
      const a = -0.6 + k * 2.2
      pts[i].set(Math.cos(a) * 0.15 + Math.sin(k * 3) * flick * k, 0.035 + Math.sin(k * Math.PI) * 0.015, Math.sin(a) * 0.15 + 0.03)
    }
  })
  return (
    <group position={ARMCHAIR.position} rotation={[0, ARMCHAIR.rotation, 0]}>
      <Hotspot id="cat" action={() => petCat('cat')} position={[0.02, 0.54, 0.08]} rotation={[0, -0.4, 0]} scale={1.15}>
        <group ref={body}>
          <mesh material={fur} rotation={[-Math.PI / 2, 0, 0.6]} scale={[1, 1, 0.75]} castShadow receiveShadow>
            <torusGeometry args={[0.1, 0.075, 20, 40, Math.PI * 1.6]} />
          </mesh>
          <mesh material={fur} position={[0, 0.03, 0]} scale={[0.11, 0.07, 0.1]} castShadow>
            <sphereGeometry args={[1, 24, 18]} />
          </mesh>
          <mesh material={belly} position={[-0.06, 0.02, 0.09]} scale={[0.05, 0.035, 0.03]}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        </group>
        <group ref={head} position={[-0.075, 0.075, 0.11]} rotation={[0, 0.9, 0]}>
          <mesh material={fur} scale={[0.06, 0.052, 0.056]} castShadow>
            <sphereGeometry args={[1, 24, 18]} />
          </mesh>
          <mesh material={belly} position={[0, -0.016, 0.043]} scale={[0.028, 0.02, 0.02]}>
            <sphereGeometry args={[1, 14, 10]} />
          </mesh>
          <Ears material={fur} y={0.045} z={0} spread={0.032} />
        </group>
        <Tail material={fur} points={tailPts} radius={0.02} />
      </Hotspot>
    </group>
  )
}

export default function Cats() {
  return (
    <group>
      <SillCat />
      <CurledCat />
    </group>
  )
}
