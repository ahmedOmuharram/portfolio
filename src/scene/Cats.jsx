import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleGeometry, LatheGeometry, MeshStandardMaterial, Quaternion, SphereGeometry, SplineCurve, Vector2, Vector3 } from 'three'
import { ui } from '../lib/store'
import { petCat } from '../lib/audio'
import Hotspot from './Hotspot'
import { ARMCHAIR } from './layout'
import { furMaterial, mottleTexture, patchTexture, skinMaterial } from './fur'

const up = new Vector3(0, 1, 0)
const LAYERS = 16
const TAIL_DENSITY = [36, 14]

const CALICO = { white: '#f3eee7', grey: '#aaa49d', orange: '#d9853c' }
const TORTIE = { orange: '#e0a262', black: '#252120', light: '#ecbd85' }

function blotches(seed, count, colors, size = [0.05, 0.11]) {
  let s = seed
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  return Array.from({ length: count }, (_, i) => {
    const r = size[0] + rnd() * (size[1] - size[0])
    return { color: colors[i % colors.length], u: rnd(), v: 0.05 + rnd() * 0.9, r, ry: r * (0.9 + rnd() * 0.8) }
  })
}

function usePet(id) {
  const state = useRef({ last: 0, react: 0, annoyed: 0 })
  return (dt, fade = 0.4) => {
    const s = state.current
    const p = ui.get().pet
    if (p && p.n !== s.last) {
      s.last = p.n
      if (p.id === id && p.kind === 'annoyed') s.annoyed = 1
      else if (p.id === id && p.kind !== 'ignore') s.react = 1
    }
    s.react = Math.max(0, s.react - dt * fade)
    s.annoyed = Math.max(0, s.annoyed - dt * 0.22)
    return s
  }
}

const noRaycast = () => null

function Fur({ geometry, material, layers = 14, ...props }) {
  const args = useMemo(() => [geometry, material, layers], [geometry, material, layers])
  return <instancedMesh args={args} raycast={noRaycast} frustumCulled={false} {...props} />
}

function Tail({ material, points, radius = 0.018, taper = 0.45, fur }) {
  const segs = useRef([])
  const geo = useMemo(() => new CapsuleGeometry(1, 1, 4, 10), [])
  const furMat = useMemo(() => fur && furMaterial(fur.map, { length: fur.length, layers: LAYERS, density: TAIL_DENSITY, gravity: 0.15 }), [fur])
  const q = useMemo(() => new Quaternion(), [])
  const dir = useMemo(() => new Vector3(), [])
  useFrame(() => {
    const pts = points.current
    for (let i = 0; i < pts.length - 1; i++) {
      const s = segs.current[i]
      if (!s) continue
      const a = pts[i]
      const b = pts[i + 1]
      dir.copy(b).sub(a)
      const len = dir.length()
      q.setFromUnitVectors(up, dir.normalize())
      s.position.copy(a).add(b).multiplyScalar(0.5)
      s.quaternion.copy(q)
      const r = radius * (1 - (i / pts.length) * taper)
      s.scale.set(r, Math.max(0.0001, (len + 2 * r) / 3), r)
    }
  })
  return (
    <group>
      {Array.from({ length: 11 }, (_, i) => (
        <group key={i} ref={(el) => (segs.current[i] = el)}>
          <mesh geometry={geo} material={material} castShadow />
          {furMat && <Fur geometry={geo} material={furMat} layers={LAYERS} />}
        </group>
      ))}
    </group>
  )
}

function Ears({ material, y, z, spread = 0.036, inner = '#c98f7a', tilt = 0.3 }) {
  const innerMat = useMemo(() => new MeshStandardMaterial({ color: inner, roughness: 0.9 }), [inner])
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * spread, y, z]} rotation={[0.1, 0, -s * tilt]}>
          <mesh material={Array.isArray(material) ? material[s > 0 ? 1 : 0] : material} castShadow>
            <coneGeometry args={[0.027, 0.06, 16]} />
          </mesh>
          <mesh material={innerMat} position={[0, -0.004, -0.009]} scale={[0.6, 0.75, 0.4]}>
            <coneGeometry args={[0.027, 0.06, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Fluffy({ geometry, map, length, density, gravity = 0.4, tint, ...props }) {
  const skin = useMemo(() => skinMaterial(map, tint), [map, tint])
  const fur = useMemo(() => furMaterial(map, { length, layers: LAYERS, density, gravity }), [map, length, density, gravity])
  return (
    <group {...props}>
      <mesh geometry={geometry} material={skin} castShadow receiveShadow />
      <Fur geometry={geometry} material={fur} layers={LAYERS} />
    </group>
  )
}

function catBody() {
  const pts = [
    [0, 0],
    [0.07, 0.004],
    [0.1, 0.02],
    [0.112, 0.055],
    [0.108, 0.095],
    [0.094, 0.135],
    [0.074, 0.175],
    [0.058, 0.215],
    [0.05, 0.25],
    [0.046, 0.275],
    [0.03, 0.29],
    [0, 0.295],
  ].map(([x, y]) => new Vector2(x * 0.9, y))
  return new LatheGeometry(new SplineCurve(pts).getPoints(48), 40)
}

const SILL_BODY = [200, 90]
const BALL_SMALL = [90, 45]
const HEAD = [120, 60]

function SillCat() {
  const body = useMemo(() => catBody(), [])
  const ball = useMemo(() => new SphereGeometry(1, 32, 24), [])
  const tex = useMemo(
    () => ({
      body: patchTexture(
        CALICO.white,
        [
          { color: CALICO.orange, u: 0.1, v: 0.78, r: 0.08, ry: 0.16 },
          { color: CALICO.grey, u: 0.93, v: 0.62, r: 0.07, ry: 0.15 },
          { color: CALICO.orange, u: 0.88, v: 0.25, r: 0.08, ry: 0.16 },
          { color: CALICO.grey, u: 0.2, v: 0.35, r: 0.06, ry: 0.13 },
          { color: CALICO.orange, u: 0.6, v: 0.7, r: 0.06, ry: 0.13 },
        ],
        { seed: 7 },
      ),
      head: patchTexture(
        CALICO.white,
        [
          { color: CALICO.orange, u: 0.12, v: 0.72, r: 0.12, ry: 0.32 },
          { color: CALICO.grey, u: 0.38, v: 0.7, r: 0.1, ry: 0.3 },
        ],
        { seed: 11 },
      ),
      orange: patchTexture(CALICO.orange, [{ color: CALICO.white, u: 0.75, v: 0.2, r: 0.12 }], { seed: 3 }),
      grey: patchTexture(CALICO.grey, [{ color: CALICO.white, u: 0.75, v: 0.2, r: 0.12 }], { seed: 5 }),
    }),
    [],
  )
  const white = useMemo(() => new MeshStandardMaterial({ color: CALICO.white, roughness: 0.9 }), [])
  const ears = useMemo(() => [new MeshStandardMaterial({ color: CALICO.orange, roughness: 0.9 }), new MeshStandardMaterial({ color: CALICO.grey, roughness: 0.9 })], [])
  const tailMap = useMemo(() => patchTexture(CALICO.orange, blotches(21, 5, [CALICO.grey, CALICO.white]), { seed: 21 }), [])
  const tailMat = useMemo(() => skinMaterial(tailMap), [tailMap])
  const tailFur = useMemo(() => ({ map: tailMap, length: 0.5 }), [tailMap])
  const torso = useRef()
  const head = useRef()
  const pet = usePet('sill')
  const tailPts = useRef(Array.from({ length: 12 }, () => new Vector3()))
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const { react, annoyed } = pet(dt)
    torso.current.scale.set(1 + Math.sin(t * 1.6) * 0.012, 1 + Math.sin(t * 1.6) * 0.018, 1)
    head.current.rotation.y = Math.sin(t * 0.23) * 0.35 + Math.sin(t * 2.1) * 0.02 + react * Math.sin(t * 3) * 0.2 + annoyed * 0.9
    head.current.rotation.x = -0.12 + Math.sin(t * 0.31) * 0.06 - react * 0.25
    const pts = tailPts.current
    const swish = (Math.sin(t * 1.2) * 0.5 + Math.sin(t * 0.37) * 0.3) * (1 + annoyed * 1.6) + annoyed * Math.sin(t * 7) * 0.5
    for (let i = 0; i < pts.length; i++) {
      const k = i / (pts.length - 1)
      const overEdge = Math.max(0, k - 0.3) / 0.7
      pts[i].set(
        0.06 + k * 0.05 + Math.sin(k * 3 + t * 1.2) * 0.02 * k + swish * 0.06 * overEdge * overEdge,
        0.03 - overEdge * overEdge * 0.26 + Math.sin(k * 2) * 0.01,
        0.08 + Math.min(k, 0.3) * 0.5 + overEdge * 0.03,
      )
    }
  })
  return (
    <Hotspot id="catSill" action={() => petCat('sill')} position={[-1.02, 0.83, -2.9]} rotation={[0, 0.25, 0]} scale={1.3}>
      <group ref={torso}>
        <Fluffy geometry={body} map={tex.body} length={0.016} density={SILL_BODY} scale={[1, 1, 0.86]} rotation={[0.08, 0, 0]} />
      </group>
      {[-1, 1].map((s) => (
        <Fluffy key={s} geometry={ball} map={s < 0 ? tex.orange : tex.grey} length={0.3} density={BALL_SMALL} position={[s * 0.07, 0.055, 0.035]} rotation={[0.3, 0, s * 0.25]} scale={[0.048, 0.058, 0.082]} />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`p${s}`} material={white} position={[s * 0.032, 0.015, -0.085]} scale={[0.024, 0.017, 0.031]} castShadow>
          <sphereGeometry args={[1, 14, 10]} />
        </mesh>
      ))}
      <group ref={head} position={[0, 0.31, -0.02]}>
        <Fluffy geometry={ball} map={tex.head} length={0.26} density={HEAD} scale={[0.058, 0.051, 0.055]} />
        {[-1, 1].map((s) => (
          <mesh key={s} material={white} position={[s * 0.034, -0.016, -0.012]} scale={[0.034, 0.03, 0.035]}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        ))}
        <mesh material={white} position={[0, -0.02, -0.048]} scale={[0.026, 0.02, 0.022]}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
        <Ears material={ears} y={0.048} z={0.002} spread={0.034} />
      </group>
      <Tail material={tailMat} points={tailPts} radius={0.022} taper={0.25} fur={tailFur} />
    </Hotspot>
  )
}

function CurledCat() {
  const coat = useMemo(() => {
    const map = mottleTexture(TORTIE.black, [TORTIE.orange, TORTIE.orange, TORTIE.light], { clusters: 17, seed: 5 })
    return new MeshStandardMaterial({ map, roughness: 0.85 })
  }, [])
  const face = useMemo(() => {
    const map = mottleTexture(TORTIE.black, [TORTIE.orange, TORTIE.light], { clusters: 6, seed: 9, focus: { u: 0.3, v: 0.55, spread: 0.2 } })
    return new MeshStandardMaterial({ map, roughness: 0.85 })
  }, [])
  const ears = useMemo(() => [new MeshStandardMaterial({ color: TORTIE.orange, roughness: 0.85 }), new MeshStandardMaterial({ color: TORTIE.black, roughness: 0.85 })], [])
  const muzzle = useMemo(() => new MeshStandardMaterial({ color: '#3a3330', roughness: 0.9 }), [])
  const tailCoat = useMemo(() => new MeshStandardMaterial({ color: TORTIE.black, roughness: 0.85 }), [])
  const body = useRef()
  const head = useRef()
  const pet = usePet('cat')
  const wag = useRef(0)
  const tailPts = useRef(Array.from({ length: 12 }, () => new Vector3()))
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const { react, annoyed } = pet(dt, 0.35)
    const breath = Math.sin(t * 1.3)
    body.current.scale.set(1 + breath * 0.012, 1 + breath * 0.035, 1 + breath * 0.012)
    head.current.rotation.x = -react * 0.6
    head.current.position.y = 0.075 + react * 0.05
    const ph = t % 6.8
    const twitch = ph < 1.5 ? Math.sin((ph / 1.5) * Math.PI) * Math.sin(ph * 6.5) * 0.3 : 0
    const target = twitch + Math.sin(t * 0.5) * 0.06 + react * Math.sin(t * 2.4) * 0.25 + annoyed * Math.sin(t * 6) * 0.5
    wag.current += (target - wag.current) * Math.min(1, dt * 8)
    const w = wag.current
    const pts = tailPts.current
    for (let i = 0; i < pts.length; i++) {
      const k = i / (pts.length - 1)
      const tip = k * k
      const a = -0.6 + k * 2.2 + w * tip * 0.7
      const r = 0.15 + Math.abs(w) * tip * 0.03
      pts[i].set(Math.cos(a) * r, 0.035 + Math.sin(k * Math.PI) * 0.015 + Math.abs(w) * tip * 0.05, Math.sin(a) * r + 0.03)
    }
  })
  return (
    <group position={ARMCHAIR.position} rotation={[0, ARMCHAIR.rotation, 0]}>
      <Hotspot id="cat" action={() => petCat('cat')} position={[0.02, 0.54, 0.08]} rotation={[0, -0.4, 0]} scale={1.15}>
        <group ref={body}>
          <mesh material={coat} rotation={[-Math.PI / 2, 0, 0.6]} scale={[1, 1, 0.75]} castShadow receiveShadow>
            <torusGeometry args={[0.1, 0.075, 20, 40, Math.PI * 1.6]} />
          </mesh>
          <mesh material={coat} position={[0, 0.03, 0]} scale={[0.11, 0.07, 0.1]} castShadow>
            <sphereGeometry args={[1, 24, 18]} />
          </mesh>
          <mesh material={muzzle} position={[-0.06, 0.02, 0.09]} scale={[0.05, 0.035, 0.03]}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        </group>
        <group ref={head} position={[-0.075, 0.075, 0.11]} rotation={[0, 0.9, 0]}>
          <mesh material={face} scale={[0.06, 0.052, 0.056]} castShadow>
            <sphereGeometry args={[1, 24, 18]} />
          </mesh>
          <mesh material={muzzle} position={[0, -0.016, 0.043]} scale={[0.028, 0.02, 0.02]}>
            <sphereGeometry args={[1, 14, 10]} />
          </mesh>
          <Ears material={ears} y={0.045} z={0} spread={0.032} />
        </group>
        <Tail material={tailCoat} points={tailPts} radius={0.02} />
      </Hotspot>
    </group>
  )
}

const FLOOR_BODY = [150, 75]
const FLOOR_RUFF = [100, 50]

function FloorCat() {
  const ball = useMemo(() => new SphereGeometry(1, 32, 24), [])
  const coat = useMemo(() => patchTexture('#ffffff', [], { seed: 13 }), [])
  const white = useMemo(() => new MeshStandardMaterial({ color: '#fbfbfb', roughness: 0.95 }), [])
  const tailSkin = useMemo(() => skinMaterial(coat, '#d9d9d9'), [coat])
  const tailFur = useMemo(() => ({ map: coat, length: 0.6 }), [coat])
  const nose = useMemo(() => new MeshStandardMaterial({ color: '#d99a95', roughness: 0.6 }), [])
  const eye = useMemo(() => new MeshStandardMaterial({ color: '#3b3632', roughness: 0.5 }), [])
  const body = useRef()
  const head = useRef()
  const pet = usePet('floor')
  const wag = useRef(0)
  const tailPts = useRef(Array.from({ length: 12 }, () => new Vector3()))
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const { react, annoyed } = pet(dt, 0.35)
    const breath = Math.sin(t * 1.1 + 1)
    body.current.scale.set(1 + breath * 0.01, 1 + breath * 0.025, 1)
    head.current.rotation.x = 0.15 - react * 0.35 + Math.sin(t * 0.4) * 0.03
    head.current.rotation.y = Math.sin(t * 0.17) * 0.25 + react * Math.sin(t * 2.6) * 0.15 - annoyed * 0.7
    head.current.rotation.z = react * 0.15
    const ph = (t + 3) % 8.3
    const twitch = ph < 1.4 ? Math.sin((ph / 1.4) * Math.PI) * Math.sin(ph * 6) * 0.25 : 0
    const target = twitch + react * Math.sin(t * 2.2) * 0.2 + annoyed * Math.sin(t * 6.5) * 0.45
    wag.current += (target - wag.current) * Math.min(1, dt * 8)
    const w = wag.current
    const pts = tailPts.current
    for (let i = 0; i < pts.length; i++) {
      const k = i / (pts.length - 1)
      const tip = k * k
      const a = -Math.PI / 2 - 0.2 + k * 2.3 + w * tip * 0.8
      const rx = 0.14 + Math.abs(w) * tip * 0.03
      pts[i].set(Math.cos(a) * rx, 0.028 + Math.abs(w) * tip * 0.05, Math.sin(a) * 0.2)
    }
  })
  return (
    <Hotspot id="catFloor" action={() => petCat('floor')} position={[0.75, 0, -0.95]} rotation={[0, 0.85, 0]} scale={1.2}>
      <group ref={body}>
        <Fluffy geometry={ball} map={coat} tint="#d9d9d9" length={0.2} density={FLOOR_BODY} position={[0, 0.082, 0]} scale={[0.115, 0.082, 0.17]} gravity={0.6} />
        <Fluffy geometry={ball} map={coat} tint="#d9d9d9" length={0.28} density={FLOOR_RUFF} position={[0, 0.1, 0.14]} scale={[0.08, 0.07, 0.055]} gravity={0.8} />
      </group>
      {[-1, 1].map((s) => (
        <mesh key={s} material={white} position={[s * 0.033, 0.012, 0.15]} scale={[0.02, 0.013, 0.028]} castShadow>
          <sphereGeometry args={[1, 14, 10]} />
        </mesh>
      ))}
      <group ref={head} position={[0, 0.165, 0.15]}>
        <Fluffy geometry={ball} map={coat} tint="#d9d9d9" length={0.2} density={HEAD} scale={[0.064, 0.056, 0.058]} gravity={0.5} />
        <mesh material={white} position={[0, -0.02, 0.05]} scale={[0.03, 0.022, 0.02]}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={`e${s}`} material={eye} position={[s * 0.025, 0.008, 0.062]} rotation={[0, s * 0.35, s * 0.12]} scale={[0.012, 0.003, 0.004]}>
            <sphereGeometry args={[1, 10, 6]} />
          </mesh>
        ))}
        <mesh material={nose} position={[0, -0.008, 0.07]} scale={[0.008, 0.006, 0.005]}>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
        <Ears material={white} y={0.05} z={-0.004} spread={0.034} inner="#e3aaa2" tilt={0.35} />
      </group>
      <Tail material={tailSkin} points={tailPts} radius={0.022} taper={0.2} fur={tailFur} />
    </Hotspot>
  )
}

export default function Cats() {
  return (
    <group>
      <SillCat />
      <CurledCat />
      <FloorCat />
    </group>
  )
}
