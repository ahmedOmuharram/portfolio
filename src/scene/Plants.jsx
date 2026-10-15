import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, Color, DoubleSide, LatheGeometry, MeshStandardMaterial, Object3D, Path, Shape, ShapeGeometry, TubeGeometry, Vector2, Vector3 } from 'three'
import { useMaterials } from './materials'
import { leafShapeGeometry } from './leafGeometry'

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function Pot({ radius = 0.16, height = 0.28, material, rim = true }) {
  const m = useMaterials()
  const geo = useMemo(() => {
    const pts = [
      new Vector2(0, 0),
      new Vector2(radius * 0.72, 0),
      new Vector2(radius * 0.78, 0.02),
      new Vector2(radius * 0.96, height * 0.85),
      new Vector2(radius, height * 0.86),
      new Vector2(radius * 1.04, height),
      new Vector2(radius * 0.92, height),
      new Vector2(radius * 0.9, height * 0.9),
    ]
    return new LatheGeometry(pts, 28)
  }, [radius, height])
  return (
    <group>
      <mesh geometry={geo} material={material || m.terracotta} castShadow receiveShadow />
      {rim && (
        <mesh position={[0, height * 0.88, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.soil} receiveShadow>
          <circleGeometry args={[radius * 0.9, 20]} />
        </mesh>
      )}
    </group>
  )
}

const dummy = new Object3D()

export function LeafyPlant({ kind = 'monstera', count = 9, height = 0.9, spread = 0.45, size = 1, seed = 1, base = 0.28, color = '#365f3a', droop = 0.4, stems = true }) {
  const m = useMaterials()
  const ref = useRef()
  const group = useRef()
  const material = useMemo(() => new MeshStandardMaterial({ color, roughness: 0.62, side: DoubleSide }), [color])
  const geometry = leafShapeGeometry(kind)
  const leaves = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + r() * 0.8
      const rad = spread * (0.35 + r() * 0.65)
      const h = base + height * (0.45 + r() * 0.55)
      const tip = new Vector3(Math.cos(a) * rad, h, Math.sin(a) * rad)
      const mid = new Vector3(Math.cos(a) * rad * 0.35, base + (h - base) * 0.75, Math.sin(a) * rad * 0.35)
      return {
        a,
        tip,
        curve: new CatmullRomCurve3([new Vector3(0, base - 0.05, 0), mid, tip]),
        elev: 0.25 + (1 - droop) * 0.9 + r() * 0.35,
        s: size * (0.7 + r() * 0.5),
        phase: r() * 10,
        shade: 0.75 + r() * 0.45,
      }
    })
  }, [count, height, spread, size, seed, base, droop])

  const stemGeos = useMemo(() => (stems ? leaves.map((l) => new TubeGeometry(l.curve, 10, 0.006 * size + 0.002, 5)) : []), [leaves, stems, size])

  useLayoutEffect(() => {
    const c = new Color()
    leaves.forEach((l, i) => {
      c.setScalar(l.shade)
      ref.current.setColorAt(i, c)
    })
    ref.current.instanceColor.needsUpdate = true
  }, [leaves])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    leaves.forEach((l, i) => {
      const w = Math.sin(t * 0.9 + l.phase) * 0.04
      dummy.position.copy(l.tip)
      dummy.rotation.set(0, 0, 0)
      dummy.rotateY(-l.a + Math.PI / 2)
      dummy.rotateX(Math.PI / 2 - l.elev + w)
      dummy.rotateZ(w * 0.6)
      dummy.scale.setScalar(l.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={group}>
      {stemGeos.map((g, i) => (
        <mesh key={i} geometry={g} material={m.stem} castShadow />
      ))}
      <instancedMesh ref={ref} args={[geometry, material, leaves.length]} castShadow receiveShadow frustumCulled={false} />
    </group>
  )
}

export function SnakePlant({ seed = 3, count = 11, height = 0.7, base = 0.22 }) {
  const ref = useRef()
  const material = useMemo(() => new MeshStandardMaterial({ color: '#4d6b3a', roughness: 0.55, side: DoubleSide }), [])
  const geometry = leafShapeGeometry('blade')
  const blades = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: count }, () => ({
      x: (r() - 0.5) * 0.12,
      z: (r() - 0.5) * 0.12,
      ry: r() * Math.PI * 2,
      rx: (r() - 0.5) * 0.25,
      rz: (r() - 0.5) * 0.25,
      s: height * (0.7 + r() * 0.6),
      shade: 0.7 + r() * 0.5,
    }))
  }, [seed, count, height])
  useLayoutEffect(() => {
    const c = new Color()
    blades.forEach((b, i) => {
      dummy.position.set(b.x, base - 0.04, b.z)
      dummy.rotation.set(b.rx, b.ry, b.rz)
      dummy.scale.set(1, b.s / 0.75, 1)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
      c.setScalar(b.shade)
      ref.current.setColorAt(i, c)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
  }, [blades, base])
  return <instancedMesh ref={ref} args={[geometry, material, blades.length]} castShadow frustumCulled={false} />
}

export function Vine({ points, leaves = 18, seed = 5, size = 1, color = '#3f7343' }) {
  const ref = useRef()
  const m = useMaterials()
  const material = useMemo(() => new MeshStandardMaterial({ color, roughness: 0.6, side: DoubleSide }), [color])
  const geometry = leafShapeGeometry('heart')
  const curve = useMemo(() => new CatmullRomCurve3(points.map((p) => new Vector3(...p))), [points])
  const tube = useMemo(() => new TubeGeometry(curve, 40, 0.004, 4), [curve])
  const items = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: leaves }, (_, i) => {
      const t = (i + 0.5) / leaves
      return { t, side: i % 2 ? 1 : -1, s: size * (0.55 + r() * 0.5), phase: r() * 10, twist: (r() - 0.5) * 0.8 }
    })
  }, [leaves, seed, size])
  const tmp = useMemo(() => new Vector3(), [])
  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    items.forEach((it, i) => {
      curve.getPointAt(it.t, tmp)
      const sway = Math.sin(time * 0.8 + it.phase) * 0.06 * it.t
      dummy.position.set(tmp.x + sway * 0.2, tmp.y, tmp.z)
      dummy.rotation.set(0.3 + sway, it.side * 1.1 + it.twist, it.side * 0.5)
      dummy.scale.setScalar(it.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group>
      <mesh geometry={tube} material={m.stem} />
      <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow frustumCulled={false} />
    </group>
  )
}

export function HangingPlanter({ position, length = 0.75 }) {
  const m = useMaterials()
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.015
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.37) * 0.012
  })
  const vines = useMemo(
    () => [
      [[0.08, 0.1, 0], [0.16, -0.1, 0.03], [0.18, -0.45, 0.06], [0.14, -0.8, 0.04]],
      [[-0.08, 0.1, 0.02], [-0.17, -0.12, 0], [-0.2, -0.5, -0.04], [-0.16, -0.95, -0.02]],
      [[0, 0.1, 0.09], [0.02, -0.1, 0.18], [0.04, -0.35, 0.2], [0.02, -0.6, 0.18]],
      [[0.02, 0.1, -0.08], [0.05, -0.15, -0.16], [0.08, -0.4, -0.18]],
    ],
    [],
  )
  return (
    <group ref={ref} position={position}>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.05, -length / 2, Math.sin(a) * 0.05]} rotation={[Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12]} material={m.brass}>
            <cylinderGeometry args={[0.002, 0.002, length, 3]} />
          </mesh>
        )
      })}
      <group position={[0, -length - 0.1, 0]}>
        <Pot radius={0.13} height={0.17} material={m.ceramic} />
        <LeafyPlant kind="heart" count={14} height={0.12} spread={0.16} size={0.9} base={0.15} seed={12} droop={0.9} stems={false} color="#3f7a46" />
        {vines.map((v, i) => (
          <Vine key={i} points={v.map(([x, y, z]) => [x, y + 0.08, z])} leaves={12} seed={20 + i} size={0.8} />
        ))}
      </group>
    </group>
  )
}
