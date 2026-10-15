import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { MeshStandardMaterial } from 'three'
import Hotspot from './Hotspot'

const LINES = ['hi! ✦', 'shipping it?', 'the cats approve', 'one more commit…', 'lofi + code', 'nice room :)', 'thanks for having me']

export default function Clawd({ position = [0.34, 0.78, -2.48], rotation = [0, 0.25, 0], scale = 1 }) {
  const body = useRef()
  const eyes = useRef([])
  const arms = useRef([])
  const root = useRef()
  const hop = useRef(0)
  const nextDance = useRef(6)
  const dance = useRef(0)
  const [line, setLine] = useState(null)
  const timer = useRef(null)
  const orange = useMemo(() => new MeshStandardMaterial({ color: '#c8603b', roughness: 0.6 }), [])
  const dark = useMemo(() => new MeshStandardMaterial({ color: '#1b1411', roughness: 0.4 }), [])

  const poke = () => {
    hop.current = 1
    setLine(LINES[Math.floor(Math.random() * LINES.length)])
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setLine(null), 2600)
  }

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    if (t > nextDance.current) {
      dance.current = 1
      nextDance.current = t + 9 + Math.random() * 8
    }
    dance.current = Math.max(0, dance.current - dt * 0.45)
    hop.current = Math.max(0, hop.current - dt * 1.3)
    const d = dance.current
    const h = hop.current
    const jump = Math.abs(Math.sin(h * Math.PI * 2)) * 0.035 * h
    const sway = Math.sin(t * 9) * 0.25 * d
    root.current.position.y = Math.abs(Math.sin(t * 9)) * 0.012 * d + jump + Math.sin(t * 2) * 0.0015
    root.current.rotation.y = sway + h * Math.PI * 2 * (1 - h)
    root.current.rotation.z = Math.sin(t * 4.5) * 0.12 * d
    body.current.scale.y = 1 + Math.sin(t * 2) * 0.012
    const blink = (t % 4.3) < 0.12 ? 0.15 : 1
    eyes.current.forEach((e) => e && (e.scale.y = blink))
    arms.current.forEach((a, i) => {
      if (!a) return
      const s = i === 0 ? 1 : -1
      a.rotation.z = s * (Math.sin(t * 9 + i) * 0.6 * d + h * 0.9)
    })
  })

  return (
    <Hotspot id="clawd" action={poke} position={position} rotation={rotation} scale={scale}>
      <group ref={root}>
        <group ref={body}>
          <RoundedBox args={[0.074, 0.05, 0.046]} radius={0.004} smoothness={2} position={[0, 0.034, 0]} material={orange} castShadow receiveShadow />
          {[-1, 1].map((s, i) => (
            <mesh key={s} ref={(el) => (eyes.current[i] = el)} position={[s * 0.016, 0.04, 0.0235]} material={dark}>
              <boxGeometry args={[0.007, 0.013, 0.002]} />
            </mesh>
          ))}
        </group>
        {[-1, 1].map((s, i) => (
          <group key={s} ref={(el) => (arms.current[i] = el)} position={[s * 0.037, 0.03, 0]}>
            <RoundedBox args={[0.016, 0.012, 0.016]} radius={0.003} smoothness={2} position={[s * 0.007, 0, 0]} material={orange} castShadow />
          </group>
        ))}
        {[
          [-0.026, 0.013],
          [-0.009, 0.013],
          [0.009, 0.013],
          [0.026, 0.013],
          [-0.026, -0.013],
          [0.026, -0.013],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.0045, z]} material={orange} castShadow>
            <boxGeometry args={[0.007, 0.009, 0.007]} />
          </mesh>
        ))}
        {line && (
          <Html position={[0, 0.11, 0]} center distanceFactor={1.4} zIndexRange={[15, 0]}>
            <div className="clawd-bubble">{line}</div>
          </Html>
        )}
      </group>
    </Hotspot>
  )
}
