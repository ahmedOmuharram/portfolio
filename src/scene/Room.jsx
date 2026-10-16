import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry } from 'three'
import { useMaterials } from './materials'
import { rugTexture } from './textures'
import { ROOM } from './layout'
import Hotspot from './Hotspot'

function Box({ args, position, material, cast = true, receive = true, rotation }) {
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow={cast} receiveShadow={receive}>
      <boxGeometry args={args} />
    </mesh>
  )
}

function Curtain({ x }) {
  const m = useMaterials()
  const ref = useRef()
  const geo = useMemo(() => {
    const g = new PlaneGeometry(0.62, 2.62, 36, 8)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i)
      const py = pos.getY(i)
      const gather = 1 - (py + 1.31) / 2.62
      pos.setZ(i, Math.sin(px * 32) * 0.035 * (1 + gather * 0.6))
      pos.setX(i, px * (1 - gather * 0.25))
    }
    g.computeVertexNormals()
    return g
  }, [])
  useFrame(({ clock }) => {
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.45 + x) * 0.006
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.3 + x) * 0.015
  })
  return (
    <group position={[x, 2.86, -2.86]}>
      <mesh ref={ref} geometry={geo} material={m.curtain} position={[0, -1.31, 0]} castShadow />
    </group>
  )
}

export default function Room() {
  const m = useMaterials()
  const { w, d, h, win } = ROOM
  const rug = useMemo(() => rugTexture(), [])
  const t = 0.2
  const bz = -d / 2 - t / 2
  const winW = win.x1 - win.x0
  const winCx = (win.x0 + win.x1) / 2
  const leftW = win.x0 + w / 2
  const rightW = w / 2 - win.x1
  const panes = 3
  const paneW = winW / panes

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={m.floor} receiveShadow>
        <planeGeometry args={[w, d]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]} material={m.ceiling}>
        <planeGeometry args={[w, d]} />
      </mesh>
      <Box args={[leftW, h, t]} position={[-w / 2 + leftW / 2, h / 2, bz]} material={m.wall} />
      <Box args={[rightW, h, t]} position={[w / 2 - rightW / 2, h / 2, bz]} material={m.wall} />
      <Box args={[winW, win.y0, t]} position={[winCx, win.y0 / 2, bz]} material={m.wall} />
      <Box args={[winW, h - win.y1, t]} position={[winCx, (h + win.y1) / 2, bz]} material={m.wall} />
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-w / 2, h / 2, 0]} material={m.wallSide} receiveShadow>
        <planeGeometry args={[d, h]} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[w / 2, h / 2, 0]} material={m.wallSide} receiveShadow>
        <planeGeometry args={[d, h]} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} position={[0, h / 2, d / 2]} material={m.wallSide}>
        <planeGeometry args={[w, h]} />
      </mesh>

      <Box args={[w, 0.12, 0.03]} position={[0, 0.06, -d / 2 + 0.015]} material={m.trim} cast={false} />
      <Box args={[0.03, 0.12, d]} position={[-w / 2 + 0.015, 0.06, 0]} material={m.trim} cast={false} />
      <Box args={[0.03, 0.12, d]} position={[w / 2 - 0.015, 0.06, 0]} material={m.trim} cast={false} />

      <group>
        <Box args={[winW + 0.08, 0.06, 0.12]} position={[winCx, win.y1 - 0.03, bz]} material={m.steel} />
        <Box args={[winW + 0.08, 0.06, 0.12]} position={[winCx, win.y0 + 0.03, bz]} material={m.steel} />
        <Box args={[0.06, win.y1 - win.y0, 0.12]} position={[win.x0 + 0.03, (win.y0 + win.y1) / 2, bz]} material={m.steel} />
        <Box args={[0.06, win.y1 - win.y0, 0.12]} position={[win.x1 - 0.03, (win.y0 + win.y1) / 2, bz]} material={m.steel} />
        {Array.from({ length: panes - 1 }, (_, i) => (
          <Box key={`v${i}`} args={[0.045, win.y1 - win.y0, 0.1]} position={[win.x0 + paneW * (i + 1), (win.y0 + win.y1) / 2, bz]} material={m.steel} />
        ))}
        <Box args={[winW, 0.04, 0.1]} position={[winCx, 2.18, bz]} material={m.steel} />
        <Box args={[winW, 0.025, 0.08]} position={[winCx, 1.5, bz]} material={m.steel} />
        {Array.from({ length: panes }, (_, i) => (
          <Box key={`m${i}`} args={[0.025, 0.52, 0.08]} position={[win.x0 + paneW * (i + 0.5), 2.44, bz]} material={m.steel} />
        ))}
      </group>

      <Hotspot id="about" position={[winCx, (win.y0 + win.y1) / 2, -3.06]}>
        <mesh>
          <planeGeometry args={[winW, win.y1 - win.y0]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      </Hotspot>

      <Box args={[winW + 0.36, 0.05, 0.5]} position={[winCx, win.y0 + 0.005, -d / 2 + 0.05]} material={m.woodDark} />

      <Box args={[4.4, 0.025, 0.025]} position={[winCx, 2.88, -2.86]} material={m.brass} cast={false} />
      <Curtain x={win.x0 - 0.3} />
      <Curtain x={win.x1 + 0.32} />

      <mesh rotation={[-Math.PI / 2, 0, 0.06]} position={[-0.5, 0.006, -0.35]} receiveShadow>
        <planeGeometry args={[2.5, 3.2]} />
        <meshStandardMaterial map={rug} roughness={1} />
      </mesh>
    </group>
  )
}
