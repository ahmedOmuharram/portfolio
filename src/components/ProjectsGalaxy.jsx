import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '../ThemeProvider'
import { useIsMobile } from '../useIsMobile'

const PALETTES = {
  dark: {
    featured: '#d24dff',  // magenta-violet — featured
    muted: '#2fd9ff',     // neon cyan — supporting
    edge: '#7a5cff',      // blue-violet filament
    edgeOpacity: 0.24,
    rim: '#c77bff',
  },
  light: {
    featured: '#ec3107',
    muted: '#8093a0',
    edge: '#6d7d88',
    edgeOpacity: 0.3,
    rim: '#ec3107',
  },
}

// Connections carried over from the original constellation.
const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [4, 5], [5, 6], [6, 7], [7, 8],
  [8, 0], [2, 6], [1, 7],
]

// Camera distance from the constellation — the single size knob.
// Lower = bigger on screen, higher = smaller. (19 was the old far view.)
const CAMERA_Z = 16

// Deterministic depth so the layout is stable between renders.
function depthFor(i, featured) {
  const s = Math.sin((i + 1) * 12.9898) * 43758.5453
  const frac = s - Math.floor(s)
  return (featured ? 2.4 : -2.2) + (frac - 0.5) * 4.2
}

function useGalaxyPositions(projects) {
  return useMemo(
    () =>
      projects.map((p, i) => {
        const x = ((p.position?.x ?? 50) / 100 - 0.5) * 17
        const y = -((p.position?.y ?? 50) / 100 - 0.5) * 9.5
        return [x, y, depthFor(i, !!p.featured)]
      }),
    [projects],
  )
}

function Node({ position, project, index, hovered, setHovered, onSelect, palette }) {
  const groupRef = useRef()
  const shellRef = useRef()
  const coreRef = useRef()
  const isHover = hovered === index
  const featured = !!project.featured
  const color = featured ? palette.featured : palette.muted
  const size = featured ? 0.62 : 0.4
  const coreR = size * 0.42
  const seed = useMemo(() => Math.random() * 10, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (shellRef.current) {
      shellRef.current.rotation.y += 0.003
      shellRef.current.rotation.x += 0.0015
    }
    if (groupRef.current) {
      const target = isHover ? 1.45 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.18)
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 1.6 + seed) * 0.12
      coreRef.current.scale.setScalar(pulse)
    }
  })

  const labelVisible = featured || isHover

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(index)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered((h) => (h === index ? null : h))
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(index)
      }}
    >
      {/* bright core — drives the bloom */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[coreR, 24, 24]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* wireframe shell — ties into the site's wireframe identity */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[size, featured ? 2 : 1]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={isHover ? 0.85 : 0.5}
          toneMapped={false}
        />
      </mesh>
      {/* invisible larger hit area so small nodes are easy to grab */}
      <mesh visible={false}>
        <sphereGeometry args={[size * 1.6, 8, 8]} />
      </mesh>

      <Html
        center
        distanceFactor={12}
        position={[0, -size - 0.55, 0]}
        pointerEvents="none"
        zIndexRange={[10, 0]}
      >
        <div
          className={`galaxy-label${featured ? ' is-featured' : ''}${
            labelVisible ? ' is-visible' : ''
          }`}
        >
          {project.shortLabel}
        </div>
      </Html>
    </group>
  )
}

function Edges({ positions, hovered, palette }) {
  return EDGES.map(([a, b], i) => {
    const lit = hovered === a || hovered === b
    return (
      <Line
        key={i}
        points={[positions[a], positions[b]]}
        color={lit ? palette.featured : palette.edge}
        lineWidth={lit ? 1.4 : 0.7}
        transparent
        opacity={lit ? 0.6 : palette.edgeOpacity}
      />
    )
  })
}

function Scene({ projects, onSelect, palette, isMobile }) {
  const positions = useGalaxyPositions(projects)
  const [hovered, setHovered] = useState(null)

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 8]} intensity={30} color={palette.rim} distance={40} />

      <Edges positions={positions} hovered={hovered} palette={palette} />
      {projects.map((p, i) => (
        <Node
          key={p.title}
          position={positions[i]}
          project={p}
          index={i}
          hovered={hovered}
          setHovered={setHovered}
          onSelect={onSelect}
          palette={palette}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={!isMobile}
        autoRotate
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
      />
    </>
  )
}

export default function ProjectsGalaxy({ projects, onSelect }) {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const palette = PALETTES[theme] ?? PALETTES.dark

  return (
    <div className="projects-galaxy">
      <Canvas
        dpr={isMobile ? 0.5 : theme === 'dark' ? 0.62 : [1, 2]}
        camera={{ position: [0, 1.5, CAMERA_Z], fov: 52 }}
        gl={{ antialias: theme !== 'dark', powerPreference: 'high-performance' }}
      >
        <Scene projects={projects} onSelect={onSelect} palette={palette} isMobile={isMobile} />
      </Canvas>
    </div>
  )
}
