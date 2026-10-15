import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MeshStandardMaterial, Object3D } from 'three'
import { RoundedBox } from '@react-three/drei'
import { useMaterials } from './materials'
import { Block, Segment } from './parts'
import { useLive } from './live'
import { spineTexture } from './textures'
import { LeafyPlant, Pot, Vine, SnakePlant } from './Plants'
import Hotspot from './Hotspot'

const PALETTE = ['#7a3b2e', '#c08a3e', '#3f5b4a', '#26364a', '#d6c7a8', '#5b2333', '#8a6a4a', '#2f2f35', '#9a5a3c', '#46604f', '#b8a27a', '#4c3a5e']

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const dummy = new Object3D()

export function BookRow({ length, depth = 0.2, maxHeight = 0.3, seed = 1, gapAt = [], lean = true }) {
  const ref = useRef()
  const material = useMemo(() => new MeshStandardMaterial({ map: spineTexture(), roughness: 0.75 }), [])
  const books = useMemo(() => {
    const r = rng(seed)
    const out = []
    let x = 0
    while (x < length) {
      if (gapAt.some(([a, b]) => x > a && x < b)) {
        x += 0.02
        continue
      }
      const w = 0.018 + r() * 0.035
      const h = maxHeight * (0.62 + r() * 0.38)
      const d = depth * (0.72 + r() * 0.28)
      if (x + w > length) break
      const tilt = lean && r() < 0.06 ? 0.18 : 0
      out.push({ x: x + w / 2 + (tilt ? 0.03 : 0), w, h, d, tilt, color: PALETTE[Math.floor(r() * PALETTE.length)], shade: 0.8 + r() * 0.35 })
      x += w + (tilt ? 0.05 : 0.002)
    }
    return out
  }, [length, depth, maxHeight, seed, gapAt, lean])
  useLayoutEffect(() => {
    const c = new Color()
    books.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2, 0)
      dummy.rotation.set(0, 0, -b.tilt)
      dummy.scale.set(b.w, b.h, b.d)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
      c.set(b.color).multiplyScalar(b.shade)
      ref.current.setColorAt(i, c)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
  }, [books])
  return (
    <instancedMesh ref={ref} args={[undefined, material, books.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}

function Frame({ position, rotation, size = [0.16, 0.2] }) {
  const m = useMaterials()
  return (
    <group position={position} rotation={rotation}>
      <Block size={[size[0], size[1], 0.018]} material={m.woodDark} />
      <mesh position={[0, 0, 0.0095]}>
        <planeGeometry args={[size[0] - 0.035, size[1] - 0.035]} />
        <meshStandardMaterial color="#c9b48e" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.01, 0.01]}>
        <circleGeometry args={[size[0] * 0.24, 24]} />
        <meshStandardMaterial color="#7a5a3a" roughness={0.9} />
      </mesh>
    </group>
  )
}

function ShelfLamp({ position }) {
  const m = useMaterials()
  const live = useLive()
  const light = useRef()
  const bulb = useRef()
  const shade = useMemo(() => new MeshStandardMaterial({ color: '#2e4a3c', roughness: 0.5, metalness: 0.3, side: 2 }), [])
  useFrame(() => {
    light.current.intensity = 0.5 + live.lamps * 4
    bulb.current.color.setRGB(1, 0.78, 0.5).multiplyScalar(1 + live.lamps * 4)
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.012, 0]} material={m.brass} castShadow>
        <cylinderGeometry args={[0.05, 0.055, 0.024, 24]} />
      </mesh>
      <Segment a={[0, 0.02, 0]} b={[0, 0.2, 0.03]} radius={0.006} material={m.brass} />
      <Segment a={[0, 0.2, 0.03]} b={[0, 0.19, 0.16]} radius={0.006} material={m.brass} />
      <mesh position={[0, 0.16, 0.17]} rotation={[0.35, 0, 0]} material={shade} castShadow>
        <coneGeometry args={[0.06, 0.08, 24, 1, true]} />
      </mesh>
      <mesh position={[0, 0.14, 0.18]}>
        <sphereGeometry args={[0.018, 12, 10]} />
        <meshBasicMaterial ref={bulb} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, 0.05, 0.3]} color="#ffb06a" distance={3.2} decay={2} />
    </group>
  )
}

export function Bookshelf() {
  const m = useMaterials()
  const width = 1.7
  const depth = 0.34
  const height = 2.15
  const levels = [0.06, 0.48, 0.9, 1.32, 1.74]
  return (
    <Hotspot id="writing" position={[-3.5 + depth / 2, 0, 1.05]} rotation={[0, Math.PI / 2, 0]}>
      <Block size={[0.03, height, depth]} position={[-width / 2, height / 2, 0]} material={m.woodDark} />
      <Block size={[0.03, height, depth]} position={[width / 2, height / 2, 0]} material={m.woodDark} />
      <Block size={[width, 0.03, depth]} position={[0, height, 0]} material={m.woodDark} />
      <Block size={[width, height, 0.01]} position={[0, height / 2, -depth / 2 + 0.005]} material={m.woodDark} />
      {levels.map((y) => (
        <Block key={y} size={[width - 0.03, 0.025, depth]} position={[0, y, 0]} material={m.woodDark} />
      ))}
      <group position={[-width / 2 + 0.03, levels[0] + 0.013, 0]}>
        <BookRow length={1.1} depth={0.26} maxHeight={0.36} seed={3} />
      </group>
      <group position={[0.42, levels[0] + 0.013, 0.02]}>
        <RoundedBox args={[0.3, 0.31, 0.3]} radius={0.01} position={[0.0, 0.155, 0]} material={m.wood} castShadow />
      </group>
      <group position={[-width / 2 + 0.03, levels[1] + 0.013, 0]}>
        <BookRow length={1.62} depth={0.24} maxHeight={0.34} seed={8} gapAt={[[0.7, 0.98]]} />
      </group>
      <group position={[-0.03, levels[1] + 0.013, 0.03]}>
        <Pot radius={0.06} height={0.1} material={m.ceramic} />
        <SnakePlant height={0.26} base={0.09} count={7} seed={9} />
      </group>
      <group position={[-width / 2 + 0.03, levels[2] + 0.013, 0]}>
        <BookRow length={0.9} depth={0.24} maxHeight={0.32} seed={14} />
      </group>
      <Frame position={[0.25, levels[2] + 0.13, -0.08]} rotation={[-0.08, 0, 0]} />
      <group position={[0.6, levels[2] + 0.013, 0.02]}>
        <Pot radius={0.07} height={0.11} />
        <Vine points={[[0.02, 0.1, 0.05], [0.05, -0.05, 0.16], [0.03, -0.3, 0.2], [0.0, -0.55, 0.19]]} leaves={14} seed={4} size={0.75} />
        <LeafyPlant kind="heart" count={9} height={0.08} spread={0.09} size={0.7} base={0.1} seed={33} droop={0.6} stems={false} />
      </group>
      <group position={[-width / 2 + 0.03, levels[3] + 0.013, 0]}>
        <BookRow length={0.55} depth={0.22} maxHeight={0.3} seed={21} />
      </group>
      <group position={[0.15, levels[3] + 0.013, 0]}>
        <BookRow length={0.6} depth={0.22} maxHeight={0.3} seed={27} />
      </group>
      <group position={[-0.5, levels[4] + 0.013, 0.02]}>
        <Pot radius={0.08} height={0.12} material={m.potDark} />
        <LeafyPlant kind="leaf" count={10} height={0.18} spread={0.14} size={0.6} base={0.12} seed={44} droop={0.5} color="#476e3c" />
      </group>
      <group position={[0.05, levels[4] + 0.013, 0]}>
        <BookRow length={0.7} depth={0.22} maxHeight={0.26} seed={35} />
      </group>
      <ShelfLamp position={[0.5, height + 0.015, 0.02]} />
    </Hotspot>
  )
}

export function WallShelf() {
  const m = useMaterials()
  return (
    <group position={[2.42, 1.86, -2.86]}>
      <Block size={[1.55, 0.04, 0.26]} position={[0, 0, 0]} material={m.wood} />
      {[-0.6, 0.6].map((x) => (
        <Block key={x} size={[0.03, 0.12, 0.2]} position={[x, -0.07, -0.02]} material={m.steel} />
      ))}
      <group position={[-0.7, 0.02, -0.02]}>
        <BookRow length={0.42} depth={0.18} maxHeight={0.26} seed={51} />
      </group>
      <group position={[-0.08, 0.02, 0.02]}>
        <Pot radius={0.075} height={0.12} />
        <Vine points={[[0.03, 0.1, 0.06], [0.08, -0.05, 0.12], [0.1, -0.35, 0.14], [0.06, -0.7, 0.12], [0.02, -0.92, 0.1]]} leaves={20} seed={8} size={0.8} />
        <Vine points={[[-0.04, 0.1, 0.06], [-0.1, -0.08, 0.12], [-0.13, -0.4, 0.12], [-0.12, -0.6, 0.1]]} leaves={14} seed={18} size={0.75} />
        <LeafyPlant kind="heart" count={12} height={0.08} spread={0.11} size={0.8} base={0.11} seed={13} droop={0.6} stems={false} />
      </group>
      <group position={[0.42, 0.02, 0]}>
        <Pot radius={0.06} height={0.1} material={m.ceramic} />
        <SnakePlant height={0.22} base={0.09} count={6} seed={17} />
      </group>
      <Frame position={[0.18, 0.13, -0.06]} rotation={[-0.06, 0, 0]} size={[0.14, 0.18]} />
    </group>
  )
}
