import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { AdditiveBlending, CanvasTexture, CylinderGeometry, DoubleSide, LatheGeometry, MeshBasicMaterial, MeshStandardMaterial, SRGBColorSpace, Vector2 } from 'three'
import { useMaterials } from './materials'
import { paperTexture } from './textures'
import { createTerminal } from './terminal'
import { Block, Segment } from './parts'
import { LAMPS } from './layout'
import { useLive } from './live'
import { LeafyPlant, Pot } from './Plants'
import Hotspot from './Hotspot'
import { lampLevel, toggleLamp } from './lamps'
import Clawd from './Clawd'
import { sip } from '../lib/audio'

const TOP = 0.78

function Monitor() {
  const m = useMaterials()
  const term = useMemo(() => createTerminal(), [])
  useEffect(() => {
    const id = setInterval(term.tick, 90)
    return () => clearInterval(id)
  }, [term])
  return (
    <Hotspot id="projects" position={[0.7, 0, -2.55]}>
      <Block size={[0.66, 0.39, 0.03]} position={[0, 1.1, 0]} material={m.plastic} />
      <mesh position={[0, 1.105, 0.0155]}>
        <planeGeometry args={[0.62, 0.35]} />
        <meshBasicMaterial map={term.texture} toneMapped={false} color={[1.15, 1.15, 1.15]} />
      </mesh>
      <Block size={[0.05, 0.26, 0.03]} position={[0, 0.9, -0.04]} material={m.plastic} />
      <Block size={[0.24, 0.012, 0.17]} position={[0, TOP + 0.006, -0.02]} material={m.plastic} />
    </Hotspot>
  )
}

function Keyboard() {
  const m = useMaterials()
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 160
    const g = c.getContext('2d')
    g.fillStyle = '#26282b'
    g.fillRect(0, 0, 512, 160)
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 15; col++) {
        g.fillStyle = row === 4 && col > 4 && col < 10 ? '#3a3d42' : '#34373b'
        g.fillRect(10 + col * 33, 10 + row * 29, 29, 25)
      }
    }
    g.fillStyle = '#d9cdb6'
    g.fillRect(10 + 13 * 33, 10 + 2 * 29, 29, 25)
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return t
  }, [])
  return (
    <group position={[0.7, TOP, -2.2]} rotation={[0, 0.02, 0]}>
      <mesh position={[0, 0.011, 0]} castShadow receiveShadow material={m.plastic}>
        <boxGeometry args={[0.44, 0.022, 0.14]} />
      </mesh>
      <mesh position={[0, 0.0225, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.43, 0.13]} />
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
      <mesh position={[0.36, 0.014, 0.01]} scale={[0.032, 0.016, 0.055]} castShadow material={m.plastic}>
        <sphereGeometry args={[1, 16, 12]} />
      </mesh>
      <mesh position={[0.36, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.26, 0.22]} />
        <meshStandardMaterial color="#2c2622" roughness={1} />
      </mesh>
    </group>
  )
}

function latteTexture() {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 256
  const g = c.getContext('2d')
  const grd = g.createLinearGradient(0, 0, 0, 256)
  grd.addColorStop(0, '#5c361c')
  grd.addColorStop(0.28, '#7d4b26')
  grd.addColorStop(0.5, '#b7895c')
  grd.addColorStop(0.68, '#e3d2bb')
  grd.addColorStop(1, '#f2ebe0')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 256)
  g.globalAlpha = 0.35
  for (let i = 0; i < 18; i++) {
    g.strokeStyle = i % 2 ? '#efe4d4' : '#6b4022'
    g.lineWidth = 2 + (i % 4)
    g.beginPath()
    const y = 70 + i * 6
    g.moveTo(0, y)
    g.bezierCurveTo(20, y - 14, 44, y + 16, 64, y - 4)
    g.stroke()
  }
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  return tex
}

function stickerTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  g.fillStyle = '#f3ede2'
  g.beginPath()
  g.arc(64, 64, 62, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = '#2f5a45'
  g.lineWidth = 5
  g.beginPath()
  g.arc(64, 64, 52, 0, Math.PI * 2)
  g.stroke()
  g.fillStyle = '#2f5a45'
  g.beginPath()
  g.moveTo(42, 88)
  g.lineTo(42, 54)
  g.lineTo(50, 36)
  g.lineTo(58, 50)
  g.lineTo(70, 50)
  g.lineTo(78, 36)
  g.lineTo(86, 54)
  g.lineTo(86, 88)
  g.closePath()
  g.fill()
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  return tex
}

const CUP = { h: 0.15, top: 0.047, bottom: 0.035 }
const FULL = 0.118
const cupRadius = (y) => CUP.bottom + (CUP.top - CUP.bottom) * (y / CUP.h) - 0.002
const liquidGeometry = (h) => new CylinderGeometry(cupRadius(h + 0.003), cupRadius(0.003), h, 36, 1)
const ICE = [
  [0.016, 0.01, 0.4, 0.2],
  [-0.017, 0.006, 1.1, 0.9],
  [0.001, -0.019, 2.2, 0.4],
  [-0.004, 0.018, 0.7, 1.6],
  [0.019, -0.012, 1.8, 2.4],
]

function IcedLatte({ position }) {
  const level = useRef(FULL)
  const target = useRef(FULL)
  const emptyAt = useRef(0)
  const liquid = useRef()
  const built = useRef(FULL)
  const liquidGeo = useMemo(() => liquidGeometry(FULL), [])
  const top = useRef()
  const ice = useRef([])
  const tex = useMemo(() => latteTexture(), [])
  const cupMat = useMemo(() => new MeshStandardMaterial({ color: '#f4f8fa', roughness: 0.06, transparent: true, opacity: 0.2, side: DoubleSide, depthWrite: false }), [])
  const iceMat = useMemo(() => new MeshStandardMaterial({ color: '#d6e9f2', roughness: 0.03, transparent: true, opacity: 0.7 }), [])
  const liquidMat = useMemo(() => new MeshStandardMaterial({ map: tex, roughness: 0.25 }), [tex])
  const strawMat = useMemo(() => new MeshStandardMaterial({ color: '#7fae86', roughness: 0.4 }), [])
  const lidMat = useMemo(() => new MeshStandardMaterial({ color: '#f4f8fa', roughness: 0.08, transparent: true, opacity: 0.38, depthWrite: false }), [])
  const stickerMat = useMemo(() => new MeshStandardMaterial({ map: stickerTexture(), roughness: 0.6, transparent: true, alphaTest: 0.5 }), [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    if (target.current <= 0.02 && emptyAt.current && performance.now() / 1000 - emptyAt.current > 9) {
      target.current = FULL
      emptyAt.current = 0
    }
    level.current += (target.current - level.current) * Math.min(1, dt * (target.current > level.current ? 0.8 : 6))
    const h = level.current
    const r = cupRadius(h + 0.004)
    if (Math.abs(h - built.current) > 0.0004) {
      const old = liquid.current.geometry
      liquid.current.geometry = liquidGeometry(h)
      if (old !== liquidGeo) old.dispose()
      built.current = h
    }
    liquid.current.position.y = 0.003 + h / 2
    top.current.position.y = h + 0.004
    top.current.scale.setScalar(r / 0.044)
    ice.current.forEach((m, i) => {
      if (!m) return
      const [x, z, a, b] = ICE[i]
      const sink = Math.max(0.012, h + 0.003 - (i % 2) * 0.005)
      m.position.set(x * Math.min(1, r / 0.04), sink + Math.sin(t * 0.8 + i) * 0.0012, z * Math.min(1, r / 0.04))
      m.rotation.set(a + Math.sin(t * 0.3 + i) * 0.05, b, a * 0.5)
    })
  })
  const sipIt = () => {
    const empty = target.current <= 0.02
    sip(empty)
    if (empty) return
    target.current = Math.max(0.02, target.current - 0.016)
    if (target.current <= 0.02) emptyAt.current = performance.now() / 1000
  }
  return (
    <Hotspot id="coffee" action={sipIt} position={position}>
      <mesh position={[0, CUP.h / 2, 0]} material={cupMat} renderOrder={2}>
        <cylinderGeometry args={[CUP.top, CUP.bottom, CUP.h, 40, 1, true]} />
      </mesh>
      <mesh position={[0, CUP.h + 0.004, 0]} material={lidMat} renderOrder={3}>
        <cylinderGeometry args={[CUP.top + 0.002, CUP.top + 0.002, 0.007, 40]} />
      </mesh>
      <mesh position={[0, CUP.h + 0.006, 0]} rotation={[Math.PI / 2, 0, 0]} material={lidMat} renderOrder={3}>
        <torusGeometry args={[CUP.top + 0.002, 0.0032, 8, 40]} />
      </mesh>
      <mesh position={[0, CUP.h + 0.009, 0]} rotation={[Math.PI / 2, 0, 0]} material={lidMat} renderOrder={3}>
        <torusGeometry args={[0.03, 0.0022, 8, 36]} />
      </mesh>
      <group rotation={[0, 0.25, 0]}>
        <mesh position={[0, 0.085, CUP.bottom + (CUP.top - CUP.bottom) * (0.085 / CUP.h) + 0.0008]} rotation={[-0.08, 0, 0]} material={stickerMat}>
          <circleGeometry args={[0.016, 28]} />
        </mesh>
      </group>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={cupMat}>
        <circleGeometry args={[CUP.bottom, 32]} />
      </mesh>
      <mesh ref={liquid} geometry={liquidGeo} position={[0, 0.003 + FULL / 2, 0]} material={liquidMat} castShadow />
      <mesh ref={top} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.044, 36]} />
        <meshStandardMaterial color="#6a3f20" roughness={0.18} />
      </mesh>
      {ICE.map((_, i) => (
        <mesh key={i} ref={(el) => (ice.current[i] = el)} material={iceMat} renderOrder={1}>
          <boxGeometry args={[0.022, 0.02, 0.022]} />
        </mesh>
      ))}
      <Segment a={[0.006, 0.012, -0.004]} b={[-0.003, CUP.h + 0.075, 0.004]} radius={0.0042} material={strawMat} radialSegments={12} />
    </Hotspot>
  )
}

function DeskLamp() {
  const m = useMaterials()
  const live = useLive()
  const bulb = useRef()
  const base = [1.79, TOP, -2.56]
  const joint = [1.84, 1.2, -2.62]
  const head = LAMPS.desk.pos
  const shadeMat = useMemo(() => new MeshStandardMaterial({ color: '#2e4a3c', roughness: 0.5, metalness: 0.3, side: 2 }), [])
  useFrame(() => {
    const on = lampLevel('lampDesk')
    bulb.current.color.setRGB(1, 0.78, 0.52).multiplyScalar(0.12 + on * (1.9 + live.lamps * 5))
  })
  return (
    <Hotspot id="lampDesk" action={() => toggleLamp('lampDesk')}>
      <mesh position={[base[0], TOP + 0.012, base[2]]} castShadow material={shadeMat}>
        <cylinderGeometry args={[0.07, 0.08, 0.024, 24]} />
      </mesh>
      <Segment a={[base[0], TOP + 0.02, base[2]]} b={joint} radius={0.008} material={m.brass} />
      <Segment a={joint} b={[head[0] + 0.03, head[1] + 0.05, head[2] - 0.02]} radius={0.008} material={m.brass} />
      <mesh position={joint} material={m.brass}>
        <sphereGeometry args={[0.016, 12, 10]} />
      </mesh>
      <group position={head} rotation={[0.15, 0, 0.75]}>
        <mesh position={[0, 0.02, 0]} castShadow material={shadeMat}>
          <coneGeometry args={[0.085, 0.13, 24, 1, true]} />
        </mesh>
        <mesh position={[0, 0.0, 0]}>
          <sphereGeometry args={[0.028, 14, 10]} />
          <meshBasicMaterial ref={bulb} toneMapped={false} />
        </mesh>
      </group>
    </Hotspot>
  )
}

function Papers() {
  const m = useMaterials()
  const tex = useMemo(() => paperTexture(['How Underspecified Prompts Shape Tool-Calling LLM Agents in Scientific Workflows', 'Ahmed Muharram']), [])
  return (
    <Hotspot id="research" position={[0.08, TOP, -2.38]} rotation={[0, 0.22, 0]}>
      <Block size={[0.215, 0.028, 0.29]} position={[0, 0.014, 0]} material={m.cream} />
      <mesh position={[0, 0.0285, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.21, 0.285]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      <Block size={[0.2, 0.012, 0.27]} position={[-0.17, 0.006, 0.04]} rotation={[0, -0.32, 0]} material={m.fabricGreen} />
      <Segment a={[-0.14, 0.016, 0.12]} b={[-0.05, 0.016, -0.02]} radius={0.004} material={m.brass} />
    </Hotspot>
  )
}

function Headphones() {
  const m = useMaterials()
  const pad = useMemo(() => new MeshStandardMaterial({ color: '#2b2622', roughness: 0.8 }), [])
  return (
    <group position={[-0.04, TOP + 0.046, -2.15]} rotation={[-Math.PI / 2 + 0.25, 0, 0.5]}>
      <mesh material={m.plastic} castShadow>
        <torusGeometry args={[0.085, 0.009, 8, 24, Math.PI]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.085, -0.01, 0]} rotation={[0, 0, Math.PI / 2]} material={pad} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.028, 20]} />
        </mesh>
      ))}
    </group>
  )
}

function PcTower() {
  const m = useMaterials()
  const live = useLive()
  const glow = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), [])
  useFrame(() => {
    glow.color.setRGB(0.32, 0.78, 0.68).multiplyScalar(0.55 + live.lamps * 0.35)
  })
  return (
    <group position={[2.22, 0, -2.42]}>
      <Block size={[0.22, 0.46, 0.44]} position={[0, 0.24, 0]} material={m.plastic} />
      <Block size={[0.22, 0.02, 0.44]} position={[0, 0.01, 0]} material={m.black} />
      <mesh position={[-0.111, 0.25, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.4, 0.38]} />
        <meshStandardMaterial color="#0b0d10" roughness={0.08} metalness={0.4} transparent opacity={0.85} />
      </mesh>
      {[0.38, 0.315].map((y) => (
        <group key={y} position={[0.04, y, 0.221]}>
          <mesh position={[0, 0, -0.0005]}>
            <circleGeometry args={[0.027, 32]} />
            <meshStandardMaterial color="#0d0f12" roughness={0.6} />
          </mesh>
          <mesh material={glow}>
            <ringGeometry args={[0.022, 0.0245, 40]} />
          </mesh>
        </group>
      ))}
      <Block size={[0.006, 0.3, 0.006]} position={[-0.09, 0.28, 0.222]} cast={false}>
        <meshBasicMaterial color={[0.6, 1.4, 1.2]} toneMapped={false} />
      </Block>
    </group>
  )
}

function Chair() {
  const m = useMaterials()
  const seat = useMemo(() => new MeshStandardMaterial({ color: '#3b2a22', roughness: 0.55 }), [])
  return (
    <group position={[1.12, 0, -1.6]} rotation={[0, 0.65, 0]}>
      <RoundedBox args={[0.5, 0.08, 0.48]} radius={0.035} position={[0, 0.48, 0]} material={seat} castShadow receiveShadow />
      <RoundedBox args={[0.46, 0.6, 0.07]} radius={0.035} position={[0, 0.86, 0.24]} rotation={[-0.12, 0, 0]} material={seat} castShadow />
      <Segment a={[0, 0.1, 0]} b={[0, 0.44, 0]} radius={0.025} material={m.steel} />
      <Segment a={[0, 0.5, 0.2]} b={[0, 0.62, 0.25]} radius={0.015} material={m.steel} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2
        return <Segment key={i} a={[0, 0.08, 0]} b={[Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3]} radius={0.016} material={m.steel} />
      })}
    </group>
  )
}

function Notebook() {
  const m = useMaterials()
  return (
    <group position={[1.38, TOP, -2.52]} rotation={[0, -0.3, 0]}>
      <Block size={[0.15, 0.02, 0.21]} position={[0, 0.01, 0]} material={m.woodDark} />
      <Block size={[0.15, 0.024, 0.21]} position={[0.01, 0.032, 0.01]} rotation={[0, 0.12, 0]} material={m.terracotta} />
    </group>
  )
}

export default function Desk() {
  const m = useMaterials()
  return (
    <group>
      <Block size={[2.15, 0.045, 0.66]} position={[0.88, TOP - 0.0225, -2.39]} material={m.wood} />
      {[
        [-0.15, -2.66],
        [1.91, -2.66],
        [-0.15, -2.1],
        [1.91, -2.1],
      ].map(([x, z], i) => (
        <Block key={i} size={[0.035, TOP - 0.045, 0.035]} position={[x, (TOP - 0.045) / 2, z]} material={m.steel} />
      ))}
      <Block size={[2.06, 0.03, 0.03]} position={[0.88, 0.12, -2.66]} material={m.steel} />
      <Monitor />
      <Keyboard />
      <IcedLatte position={[1.32, TOP, -2.2]} />
      <DeskLamp />
      <Papers />
      <Headphones />
      <Notebook />
      <group position={[-0.06, TOP, -2.6]}>
        <Pot radius={0.06} height={0.09} material={m.ceramic} />
        <LeafyPlant kind="heart" count={10} height={0.08} spread={0.08} size={0.75} base={0.08} seed={31} droop={0.5} stems={false} color="#4b8650" />
      </group>
      <Clawd position={[0.34, TOP, -2.48]} rotation={[0, 0.25, 0]} scale={1.25} />
      <PcTower />
      <Chair />
    </group>
  )
}
