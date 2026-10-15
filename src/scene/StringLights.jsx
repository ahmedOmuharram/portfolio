import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, Color, Object3D, TubeGeometry, Vector3 } from 'three'
import { useLive } from './live'

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
  { anchors: [[-2.3, 2.95, -2.92], [-1.0, 2.96, -2.92], [0.3, 2.95, -2.92], [1.6, 2.96, -2.92], [2.9, 2.95, -2.92]], sag: 0.16, bulbs: 44 },
  { anchors: [[3.46, 2.7, -2.7], [3.46, 2.72, -1.6], [3.46, 2.7, -0.5], [3.46, 2.66, 0.4]], sag: 0.14, bulbs: 30 },
]

function Strand({ anchors, sag, bulbs, seed }) {
  const live = useLive()
  const ref = useRef()
  const curve = useMemo(() => strand(anchors, sag), [anchors, sag])
  const wire = useMemo(() => new TubeGeometry(curve, 160, 0.0025, 4), [curve])
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
    const base = 0.35 + live.lamps * 2.6
    items.forEach((it, i) => {
      const tw = 0.75 + 0.25 * Math.sin(t * it.speed + it.phase)
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
        <sphereGeometry args={[0.014, 10, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

export default function StringLights() {
  return (
    <group>
      {STRANDS.map((s, i) => (
        <Strand key={i} {...s} seed={i * 3.1} />
      ))}
    </group>
  )
}
