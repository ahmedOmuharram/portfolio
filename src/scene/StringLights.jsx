import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, Color, Object3D, TubeGeometry, Vector3 } from 'three'
import { useLive } from './live'
import Hotspot from './Hotspot'
import { lampLevel, toggleLamp } from './lamps'

const dummy = new Object3D()

function strand(anchors, sag = 0.18, per = 6) {
  const pts = []
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = new Vector3(...anchors[i])
    const b = new Vector3(...anchors[i + 1])
    for (let k = 0; k < per; k++) {
      const t = k / per
      const p = a.clone().lerp(b, t)
      p.y -= Math.sin(t * Math.PI) * sag
      pts.push(p)
    }
  }
  pts.push(new Vector3(...anchors[anchors.length - 1]))
  return new CatmullRomCurve3(pts)
}

const STRANDS = [
  { anchors: [[-2.3, 3.04, -2.96], [-1.0, 3.05, -2.96], [0.3, 3.04, -2.96], [1.6, 3.05, -2.96], [2.9, 3.04, -2.96]], sag: 0.1, bulbs: 44 },
  { anchors: [[3.46, 2.7, -2.7], [3.46, 2.72, -1.6], [3.46, 2.7, -0.5], [3.46, 2.66, 0.4]], sag: 0.14, bulbs: 30 },
]

function Strand({ anchors, sag, bulbs, seed }) {
  const live = useLive()
  const ref = useRef()
  const curve = useMemo(() => strand(anchors, sag), [anchors, sag])
  const wire = useMemo(() => new TubeGeometry(curve, 160, 0.0025, 4), [curve])
  const hit = useMemo(() => new TubeGeometry(curve, 60, 0.07, 6), [curve])
  const items = useMemo(() => Array.from({ length: bulbs }, (_, i) => ({ t: (i + 0.5) / bulbs, phase: (i * 1.7 + seed) % 6.28, speed: 0.6 + ((i * 7) % 5) * 0.25 })), [bulbs, seed])
  const tmp = useMemo(() => new Vector3(), [])
  const color = useMemo(() => new Color(), [])
  useLayoutEffect(() => {
    items.forEach((it, i) => {
      curve.getPointAt(it.t, tmp)
      dummy.position.copy(tmp)
      dummy.position.y -= 0.018
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [items, curve, tmp])
  useFrame(() => {
    const t = live.time
    const on = lampLevel('lampStrings')
    const base = 0.05 + on * (0.3 + live.lamps * 1.9)
    items.forEach((it, i) => {
      const tw = 0.9 + 0.1 * Math.sin(t * it.speed * 0.6 + it.phase)
      color.setRGB(1, 0.72, 0.4).multiplyScalar(base * tw)
      ref.current.setColorAt(i, color)
    })
    ref.current.instanceColor.needsUpdate = true
  })
  return (
    <group>
      <mesh geometry={wire}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, items.length]} frustumCulled={false}>
        <sphereGeometry args={[0.016, 12, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh geometry={hit} visible={false} />
    </group>
  )
}

export default function StringLights() {
  return (
    <Hotspot id="lampStrings" action={() => toggleLamp('lampStrings')}>
      {STRANDS.map((s, i) => (
        <Strand key={i} {...s} seed={i * 3.1} />
      ))}
    </Hotspot>
  )
}
