import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { AdditiveBlending, CanvasTexture, LatheGeometry, MeshStandardMaterial, SRGBColorSpace, Vector2 } from 'three'
import { useMaterials } from './materials'
import { paperTexture } from './textures'
import { createTerminal } from './terminal'
import { Block, Segment } from './parts'
import { LAMPS } from './layout'
import { useLive } from './live'
import { LeafyPlant, Pot } from './Plants'
import Hotspot from './Hotspot'
import Clawd from './Clawd'

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

function steamTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,255,255,0.55)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  return new CanvasTexture(c)
}

function Mug({ position }) {
  const live = useLive()
  const steam = useRef([])
  const tex = useMemo(() => steamTexture(), [])
  const body = useMemo(() => {
    const pts = [
      new Vector2(0, 0),
      new Vector2(0.038, 0),
      new Vector2(0.041, 0.006),
      new Vector2(0.043, 0.095),
      new Vector2(0.039, 0.095),
      new Vector2(0.037, 0.01),
      new Vector2(0, 0.01),
    ]
    return new LatheGeometry(pts, 28)
  }, [])
  const mugMat = useMemo(() => new MeshStandardMaterial({ color: '#c8643f', roughness: 0.35 }), [])
  const puffs = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ offset: i / 7, drift: Math.random() * 6 })), [])
  useFrame(() => {
    const t = live.time
    puffs.forEach((p, i) => {
      const s = steam.current[i]
      if (!s) return
      const k = (t * 0.22 + p.offset) % 1
      s.position.set(Math.sin(t * 0.9 + p.drift) * 0.018 * k * 2, 0.11 + k * 0.26, Math.cos(t * 0.7 + p.drift) * 0.012)
      s.scale.setScalar(0.04 + k * 0.09)
      s.material.opacity = Math.sin(k * Math.PI) * 0.22
    })
  })
  return (
    <group position={position}>
      <mesh geometry={body} material={mugMat} castShadow receiveShadow />
      <mesh position={[0, 0.082, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.038, 24]} />
        <meshStandardMaterial color="#2a160c" roughness={0.15} />
      </mesh>
      <mesh position={[0.05, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} material={mugMat} castShadow>
        <torusGeometry args={[0.022, 0.007, 8, 16, Math.PI]} />
      </mesh>
      {puffs.map((_, i) => (
        <sprite key={i} ref={(el) => (steam.current[i] = el)}>
          <spriteMaterial map={tex} transparent depthWrite={false} blending={AdditiveBlending} color="#e9e2d6" />
        </sprite>
      ))}
    </group>
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
    bulb.current.color.setRGB(1, 0.78, 0.52).multiplyScalar(2 + live.lamps * 5)
  })
  return (
    <group>
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
    </group>
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
    <group position={[-0.02, TOP + 0.03, -2.12]} rotation={[-Math.PI / 2 + 0.25, 0, 0.5]}>
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
  const glow = useRef()
  const fans = useRef([])
  useFrame((_, dt) => {
    const k = 0.7 + live.lamps * 0.6
    glow.current.color.setRGB(0.45, 1.1, 0.95).multiplyScalar(k)
    fans.current.forEach((f) => f && (f.rotation.z += dt * 4))
  })
  return (
    <group position={[2.22, 0, -2.42]}>
      <Block size={[0.22, 0.46, 0.44]} position={[0, 0.24, 0]} material={m.plastic} />
      <Block size={[0.22, 0.02, 0.44]} position={[0, 0.01, 0]} material={m.black} />
      <mesh position={[-0.111, 0.25, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.4, 0.38]} />
        <meshStandardMaterial color="#0b0d10" roughness={0.08} metalness={0.4} transparent opacity={0.85} />
      </mesh>
      {[0.36, 0.2].map((y, i) => (
        <mesh key={y} ref={(el) => (fans.current[i] = el)} position={[0.09, y, 0.221]}>
          <ringGeometry args={[0.045, 0.06, 24]} />
          <meshBasicMaterial ref={i === 0 ? glow : undefined} color="#7fe0cf" toneMapped={false} />
        </mesh>
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
      <Mug position={[1.32, TOP, -2.2]} />
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
