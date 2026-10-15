import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, DoubleSide, Object3D, Shape, ShapeGeometry, IcosahedronGeometry, BufferGeometry, Float32BufferAttribute, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from 'three'
import { useLive } from './live'

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function leafGeometry() {
  const s = new Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(0.09, 0.06, 0.1, 0.22, 0, 0.32)
  s.bezierCurveTo(-0.1, 0.22, -0.09, 0.06, 0, 0)
  const g = new ShapeGeometry(s, 6)
  return g
}

function blobGeometry() {
  const g = new IcosahedronGeometry(1, 4)
  const pos = g.attributes.position
  const colors = []
  const v = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n =
      Math.sin(v.x * 3.1 + v.y * 1.7) * 0.09 +
      Math.sin(v.y * 4.3 - v.z * 2.9) * 0.07 +
      Math.sin(v.z * 5.7 + v.x * 3.3) * 0.05 +
      Math.sin(v.x * 9.1 - v.y * 8.3 + v.z * 7.7) * 0.03
    v.multiplyScalar(1 + n)
    v.y *= 0.82
    pos.setXYZ(i, v.x, v.y, v.z)
    const shade = 0.55 + 0.45 * Math.min(1, Math.max(0, (v.y + 0.8) / 1.6)) + n * 0.8
    colors.push(shade, shade, shade)
  }
  g.setAttribute('color', new Float32BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}

const dummy = new Object3D()

function Canopy() {
  const live = useLive()
  const ref = useRef()
  const mat = useRef()
  const geometry = useMemo(() => blobGeometry(), [])
  const blobs = useMemo(() => {
    const r = rng(42)
    const out = []
    const trees = [
      [-6.5, -7, 3.6], [-2.8, -8.5, 4.2], [1.8, -7.6, 3.8], [5.6, -8, 4.4], [-10, -11, 4.5],
      [9.5, -11, 5], [-1, -13, 5], [4, -15, 5.5], [-6, -16, 5.5], [12, -17, 6], [-13, -18, 6],
      [0, -22, 7], [8, -24, 7], [-9, -25, 7], [15, -28, 7], [-17, -29, 7], [3.5, -30, 8],
    ]
    for (const [x, z, size] of trees) {
      const count = 9 + Math.floor(r() * 5)
      for (let i = 0; i < count; i++) {
        const a = r() * Math.PI * 2
        const rad = r() * size * 0.55
        out.push({
          x: x + Math.cos(a) * rad,
          y: -4.2 + r() * size * 0.7 + (size - 3.6) * 0.3,
          z: z + Math.sin(a) * rad * 0.6,
          s: size * (0.26 + r() * 0.22),
          phase: r() * 10,
          shade: 0.7 + r() * 0.5,
        })
      }
    }
    return out
  }, [])

  useLayoutEffect(() => {
    const c = new Color()
    blobs.forEach((b, i) => {
      c.setScalar(b.shade)
      ref.current.setColorAt(i, c)
    })
    ref.current.instanceColor.needsUpdate = true
  }, [blobs])

  useFrame(() => {
    const t = live.time
    blobs.forEach((b, i) => {
      const sway = Math.sin(t * 0.6 + b.phase) * 0.06 * b.s * 0.25
      dummy.position.set(b.x + sway, b.y, b.z)
      dummy.rotation.set(sway * 0.3, b.phase, 0)
      dummy.scale.setScalar(b.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    mat.current.color.copy(live.foliage)
    mat.current.emissive.copy(live.foliageLit).multiplyScalar(0.12 + live.facing * 0.1)
  })

  return (
    <instancedMesh ref={ref} args={[geometry, null, blobs.length]} frustumCulled={false}>
      <meshStandardMaterial ref={mat} roughness={0.95} vertexColors />
    </instancedMesh>
  )
}

function Trunks() {
  const live = useLive()
  const mat = useMemo(() => new MeshStandardMaterial({ color: '#2a2018', roughness: 1 }), [])
  useFrame(() => mat.color.copy(live.foliage).multiplyScalar(0.55))
  const trunks = [[-6.5, -7], [-2.8, -8.5], [1.8, -7.6], [5.6, -8], [-10, -11], [9.5, -11]]
  return (
    <group>
      {trunks.map(([x, z], i) => (
        <mesh key={i} position={[x, -2.5, z]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.05]} material={mat}>
          <cylinderGeometry args={[0.12, 0.22, 5, 12]} />
        </mesh>
      ))}
    </group>
  )
}

function NearLeaves() {
  const live = useLive()
  const ref = useRef()
  const mat = useRef()
  const geometry = useMemo(() => leafGeometry(), [])
  const leaves = useMemo(() => {
    const r = rng(7)
    const out = []
    const branches = [
      { from: [-3.4, 3.4, -3.9], to: [-0.4, 2.2, -3.7], n: 70 },
      { from: [3.2, 3.6, -4.2], to: [0.9, 2.5, -4.0], n: 60 },
      { from: [-3.0, 0.2, -4.6], to: [-1.2, 1.5, -4.4], n: 40 },
      { from: [2.8, 0.0, -4.8], to: [1.4, 1.2, -4.5], n: 36 },
    ]
    for (const b of branches) {
      for (let i = 0; i < b.n; i++) {
        const t = r()
        const sag = Math.sin(t * Math.PI) * -0.35
        out.push({
          x: b.from[0] + (b.to[0] - b.from[0]) * t + (r() - 0.5) * 0.5,
          y: b.from[1] + (b.to[1] - b.from[1]) * t + sag + (r() - 0.5) * 0.45,
          z: b.from[2] + (b.to[2] - b.from[2]) * t + (r() - 0.5) * 0.4,
          rx: (r() - 0.5) * 1.6,
          ry: (r() - 0.5) * 2.4,
          rz: r() * Math.PI * 2,
          s: 0.8 + r() * 0.9,
          phase: r() * 10,
          shade: 0.6 + r() * 0.6,
        })
      }
    }
    return out
  }, [])

  useLayoutEffect(() => {
    const c = new Color()
    leaves.forEach((l, i) => {
      c.setScalar(l.shade)
      ref.current.setColorAt(i, c)
    })
    ref.current.instanceColor.needsUpdate = true
  }, [leaves])

  useFrame(() => {
    const t = live.time
    leaves.forEach((l, i) => {
      const w = Math.sin(t * 1.1 + l.phase) * 0.12
      dummy.position.set(l.x, l.y + w * 0.08, l.z)
      dummy.rotation.set(l.rx + w, l.ry, l.rz + w * 0.5)
      dummy.scale.setScalar(l.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    mat.current.color.copy(live.foliage).lerp(live.foliageLit, 0.35)
  })

  return (
    <instancedMesh ref={ref} args={[geometry, null, leaves.length]} frustumCulled={false}>
      <meshStandardMaterial ref={mat} side={DoubleSide} roughness={0.8} />
    </instancedMesh>
  )
}

function City() {
  const live = useLive()
  const winMat = useRef()
  const { buildings, windows } = useMemo(() => {
    const r = rng(1234)
    const b = []
    const w = []
    let x = -40
    while (x < 40) {
      const width = 2 + r() * 4
      const height = 3 + r() * 9 + (Math.abs(x) < 10 ? 4 : 0)
      b.push({ x: x + width / 2, width, height })
      for (let wy = 1; wy < height - 0.5; wy += 1.1) {
        for (let wx = 0.5; wx < width - 0.4; wx += 0.9) {
          if (r() < 0.32) w.push([x + wx, -4 + wy, -44.6, r()])
        }
      }
      x += width + 0.2 + r() * 1.5
    }
    return { buildings: b, windows: w }
  }, [])
  const windowGeo = useMemo(() => {
    const g = new BufferGeometry()
    const pos = []
    const col = []
    windows.forEach(([x, y, z, v]) => {
      pos.push(x, y, z)
      const warm = v > 0.3
      col.push(warm ? 1 : 0.7, warm ? 0.72 : 0.8, warm ? 0.42 : 1)
    })
    g.setAttribute('position', new Float32BufferAttribute(pos, 3))
    g.setAttribute('color', new Float32BufferAttribute(col, 3))
    return g
  }, [windows])
  const bodyMat = useMemo(() => new MeshBasicMaterial({ color: '#1a1d2a', fog: false }), [])
  useFrame(() => {
    winMat.current.opacity = live.city
    bodyMat.color.copy(live.fog).lerp(live.skyBottom, 0.45).multiplyScalar(0.5 + 0.3 * (1 - live.stars))
  })
  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, -4 + b.height / 2, -45]} material={bodyMat}>
          <boxGeometry args={[b.width, b.height, 1]} />
        </mesh>
      ))}
      <points geometry={windowGeo}>
        <pointsMaterial ref={winMat} size={0.32} vertexColors transparent depthWrite={false} sizeAttenuation fog={false} />
      </points>
    </group>
  )
}

function Fireflies() {
  const live = useLive()
  const ref = useRef()
  const mat = useRef()
  const count = 60
  const seeds = useMemo(() => {
    const r = rng(77)
    return Array.from({ length: count }, () => [(r() - 0.5) * 12, r() * 3.5 - 0.5, -4.5 - r() * 6, r() * 10])
  }, [])
  const geo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(count * 3), 3))
    return g
  }, [])
  useFrame(() => {
    const t = live.time
    const arr = geo.attributes.position.array
    seeds.forEach(([x, y, z, p], i) => {
      arr[i * 3] = x + Math.sin(t * 0.3 + p) * 0.6
      arr[i * 3 + 1] = y + Math.sin(t * 0.5 + p * 2) * 0.3
      arr[i * 3 + 2] = z + Math.cos(t * 0.25 + p) * 0.4
    })
    geo.attributes.position.needsUpdate = true
    mat.current.opacity = live.fireflies * (0.6 + 0.4 * Math.sin(t * 2))
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial ref={mat} color="#ffd98a" size={0.07} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  )
}

export default function Outside() {
  return (
    <group>
      <Canopy />
      <Trunks />
      <NearLeaves />
      <City />
      <Fireflies />
    </group>
  )
}
