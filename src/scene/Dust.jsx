import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferGeometry, CanvasTexture, Float32BufferAttribute } from 'three'
import { useLive } from './live'

function dotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 32
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.4, 'rgba(255,255,255,0.35)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 32, 32)
  return new CanvasTexture(c)
}

const CLOUDS = [
  { center: [1.25, 1.0, -2.3], size: [0.9, 0.55, 0.5], count: 70, color: '#ffcf96' },
  { center: [-2.9, 1.1, -1.1], size: [0.9, 1.0, 0.9], count: 60, color: '#ffc58a' },
  { center: [-0.2, 1.5, -2.2], size: [2.4, 1.3, 1.2], count: 90, color: '#c9d6ff' },
]

function Cloud({ center, size, count, color, seed, map }) {
  const live = useLive()
  const mat = useRef()
  const seeds = useMemo(() => {
    let s = seed
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    return Array.from({ length: count }, () => [r(), r(), r(), r() * 10, 0.3 + r() * 0.7])
  }, [count, seed])
  const geo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(count * 3), 3))
    return g
  }, [count])
  useFrame(() => {
    const t = live.time
    const arr = geo.attributes.position.array
    seeds.forEach(([x, y, z, p, sp], i) => {
      arr[i * 3] = center[0] + (x - 0.5) * size[0] + Math.sin(t * 0.13 * sp + p) * 0.08
      arr[i * 3 + 1] = center[1] + (((y + t * 0.012 * sp) % 1) - 0.5) * size[1]
      arr[i * 3 + 2] = center[2] + (z - 0.5) * size[2] + Math.cos(t * 0.11 * sp + p) * 0.08
    })
    geo.attributes.position.needsUpdate = true
    const k = color === '#c9d6ff' ? 0.25 + live.facing * 0.8 + live.stars * 0.25 : 0.25 + live.lamps * 0.75
    mat.current.opacity = 0.55 * k
  })
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial ref={mat} map={map} color={color} size={0.012} transparent depthWrite={false} blending={AdditiveBlending} sizeAttenuation toneMapped={false} />
    </points>
  )
}

export default function Dust() {
  const map = useMemo(() => dotTexture(), [])
  return (
    <group>
      {CLOUDS.map((c, i) => (
        <Cloud key={i} {...c} seed={i * 977 + 13} map={map} />
      ))}
    </group>
  )
}
