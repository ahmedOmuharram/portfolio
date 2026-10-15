import { useMemo } from 'react'
import { CatmullRomCurve3, MeshStandardMaterial, TubeGeometry, Vector3 } from 'three'
import { useMaterials } from './materials'
import { Block } from './parts'
import { corkTexture, noteTexture, polaroidTexture } from './textures'
import { BOARD } from '../data/site'
import Hotspot from './Hotspot'

const NOTE_SLOTS = [
  [-0.5, 0.24, -0.05],
  [-0.12, 0.27, 0.04],
  [-0.46, -0.16, 0.06],
  [-0.08, -0.13, -0.03],
]

const POLAROID_SLOTS = [
  [0.33, 0.22, 0.08],
  [0.55, -0.1, -0.07],
  [0.27, -0.2, 0.05],
]

const PAPERS = ['#efe6d2', '#e9d8b4', '#dfe5d6', '#f0dccf']
const ACCENTS = ['#b5523b', '#8a6a2a', '#3f6b4a', '#7a3b5e']

function Pin({ position, color = '#b5523b' }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.012]} castShadow>
        <sphereGeometry args={[0.012, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  )
}

export default function Board() {
  const m = useMaterials()
  const cork = useMemo(() => new MeshStandardMaterial({ map: corkTexture(), roughness: 1 }), [])
  const notes = useMemo(
    () =>
      BOARD.notes.map((n, i) => ({
        ...n,
        tex: noteTexture({ ...n, paper: PAPERS[i % PAPERS.length], accent: ACCENTS[i % ACCENTS.length], seed: i + 3 }),
      })),
    [],
  )
  const polaroids = useMemo(() => BOARD.polaroids.map((p) => ({ ...p, tex: polaroidTexture(p.src, p.caption) })), [])
  const width = 1.42
  const height = 0.92
  const twine = useMemo(() => {
    const pts = [NOTE_SLOTS[0], NOTE_SLOTS[1], POLAROID_SLOTS[0], POLAROID_SLOTS[1]].map(([x, y]) => new Vector3(x, y + 0.08, 0.012))
    const curve = new CatmullRomCurve3(pts)
    return new TubeGeometry(curve, 60, 0.0018, 4)
  }, [])
  return (
    <Hotspot id="experience" position={[3.485, 1.66, -1.5]} rotation={[0, -Math.PI / 2, 0]}>
      <Block size={[width + 0.05, height + 0.05, 0.025]} position={[0, 0, -0.012]} material={m.woodDark} />
      <mesh position={[0, 0, 0.002]} material={cork} receiveShadow>
        <planeGeometry args={[width, height]} />
      </mesh>
      {notes.map((n, i) => {
        const [x, y, r] = NOTE_SLOTS[i]
        return (
          <group key={n.title + i} position={[x, y, 0.005 + i * 0.001]} rotation={[0, 0, r]}>
            <mesh castShadow receiveShadow>
              <planeGeometry args={[0.32, 0.26]} />
              <meshStandardMaterial map={n.tex} roughness={0.95} />
            </mesh>
            <Pin position={[0.115, 0.1, 0]} color={ACCENTS[i % ACCENTS.length]} />
          </group>
        )
      })}
      {polaroids.map((p, i) => {
        const [x, y, r] = POLAROID_SLOTS[i]
        return (
          <group key={p.caption} position={[x, y, 0.01 + i * 0.001]} rotation={[0, 0, r]}>
            <mesh castShadow receiveShadow>
              <planeGeometry args={[0.2, 0.235]} />
              <meshStandardMaterial map={p.tex} roughness={0.8} />
            </mesh>
            <Block size={[0.07, 0.02, 0.002]} position={[0, 0.115, 0.002]} rotation={[0, 0, 0.1]} cast={false}>
              <meshStandardMaterial color="#e8dcb8" transparent opacity={0.75} roughness={1} />
            </Block>
          </group>
        )
      })}
      <mesh geometry={twine}>
        <meshStandardMaterial color="#b5523b" roughness={0.9} />
      </mesh>
    </Hotspot>
  )
}
