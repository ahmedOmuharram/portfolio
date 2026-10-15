import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, DoubleSide, PlaneGeometry, Quaternion, Vector3 } from 'three'
import { useLive } from './live'
import { ROOM } from './layout'

const vertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragment = `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;
varying vec2 vUv;
void main() {
  float along = vUv.y;
  float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
  float fade = pow(along, 1.6);
  float shimmer = 0.85 + 0.15 * sin(vUv.x * 18.0 + uTime * 0.6 + along * 6.0);
  gl_FragColor = vec4(uColor * uIntensity * edge * fade * shimmer, 1.0);
}
`

const down = new Vector3(0, -1, 0)

function Beam({ origin, width, height, uniforms }) {
  const ref = useRef()
  const live = useLive()
  const geoA = useMemo(() => new PlaneGeometry(width, 4.2, 1, 1).translate(0, -2.1, 0), [width])
  const geoB = useMemo(() => new PlaneGeometry(height, 4.2, 1, 1).translate(0, -2.1, 0), [height])
  const q = useMemo(() => new Quaternion(), [])
  const dir = useMemo(() => new Vector3(), [])
  useFrame(() => {
    dir.copy(live.dir).multiplyScalar(-1).normalize()
    q.setFromUnitVectors(down, dir)
    ref.current.quaternion.copy(q)
  })
  return (
    <group ref={ref} position={origin}>
      <mesh geometry={geoA} rotation={[0, 0, 0]} renderOrder={5}>
        <shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} blending={AdditiveBlending} side={DoubleSide} toneMapped={false} />
      </mesh>
      <mesh geometry={geoB} rotation={[0, Math.PI / 2, 0]} renderOrder={5}>
        <shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} blending={AdditiveBlending} side={DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function SunBeams() {
  const live = useLive()
  const uniforms = useMemo(() => ({ uColor: { value: new Color() }, uIntensity: { value: 0 }, uTime: { value: 0 } }), [])
  const { win } = ROOM
  const paneW = (win.x1 - win.x0) / 3
  const beams = useMemo(
    () =>
      [0, 1, 2].map((i) => ({
        origin: [win.x0 + paneW * (i + 0.5), (win.y0 + 2.18) / 2, -3.02],
        width: paneW * 0.86,
        height: 2.18 - win.y0 - 0.1,
      })),
    [win, paneW],
  )
  useFrame(() => {
    const sun = live.facing * Math.min(1, live.sunIntensity / 3) * (1 - live.stars)
    const moon = live.stars * live.facing * 0.35
    uniforms.uColor.value.copy(live.sun)
    uniforms.uIntensity.value = sun * 0.09 + moon * 0.05
    uniforms.uTime.value = live.time
  })
  return (
    <group>
      {beams.map((b, i) => (
        <Beam key={i} {...b} uniforms={uniforms} />
      ))}
    </group>
  )
}
