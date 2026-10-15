import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Color, Vector3 } from 'three'
import { useSky } from '../lib/useSky'
import { LiveContext, useLive } from './live'

const COLOR_KEYS = ['skyTop', 'skyMid', 'skyBottom', 'glow', 'sun', 'ambient', 'hemiGround', 'foliage', 'foliageLit', 'fog']
const NUMBER_KEYS = ['sunIntensity', 'ambientIntensity', 'lamps', 'stars', 'city', 'exposure', 'fireflies', 'facing']

export function SkyProvider({ children }) {
  const sky = useSky()
  const target = sky.state
  const live = useMemo(() => {
    const o = { dir: new Vector3(), primed: false, time: 0 }
    COLOR_KEYS.forEach((k) => (o[k] = new Color()))
    NUMBER_KEYS.forEach((k) => (o[k] = 0))
    return o
  }, [])
  const goal = useRef(target)
  goal.current = target
  const tmp = useMemo(() => new Color(), [])
  const tmpDir = useMemo(() => new Vector3(), [])

  useFrame((_, delta) => {
    const t = goal.current
    const k = live.primed ? 1 - Math.exp(-Math.min(delta, 0.1) * 1.6) : 1
    COLOR_KEYS.forEach((key) => live[key].lerp(tmp.set(t[key]), k))
    NUMBER_KEYS.forEach((key) => (live[key] += (t[key] - live[key]) * k))
    live.dir.lerp(tmpDir.set(t.dir[0], t.dir[1], t.dir[2]), k).normalize()
    live.primed = true
    live.time += delta
  }, -10)

  return <LiveContext.Provider value={live}>{children}</LiveContext.Provider>
}

const skyVertex = `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * p;
}
`

const skyFragment = `
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uStars;
uniform float uTime;
varying vec3 vDir;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uBottom, uMid, smoothstep(-0.02, 0.22, h));
  col = mix(col, uTop, smoothstep(0.18, 0.75, h));
  float sunAmt = max(dot(d, normalize(uSunDir)), 0.0);
  float horizon = exp(-abs(h) * 6.0);
  col += uGlow * pow(sunAmt, 6.0) * 0.55 * (1.0 - uStars * 0.7);
  col += uGlow * horizon * 0.18 * (1.0 - uStars * 0.6);
  float disc = smoothstep(0.9993, 0.9997, sunAmt);
  float halo = pow(sunAmt, 300.0);
  vec3 discColor = mix(uSunColor * 3.0, vec3(0.92, 0.94, 1.0) * 2.2, uStars);
  col += discColor * (disc + halo * 0.6);
  if (uStars > 0.01 && h > 0.0) {
    vec3 cell = floor(d * 260.0);
    float s = hash(cell);
    float tw = 0.6 + 0.4 * sin(uTime * (1.5 + s * 3.0) + s * 40.0);
    float star = step(0.9965, s) * tw * smoothstep(0.02, 0.25, h);
    col += vec3(star) * uStars * 1.4;
  }
  gl_FragColor = vec4(min(col, vec3(4.0)), 1.0);
  #include <colorspace_fragment>
}
`

export function SkyDome() {
  const live = useLive()
  const uniforms = useMemo(
    () => ({
      uTop: { value: new Color() },
      uMid: { value: new Color() },
      uBottom: { value: new Color() },
      uGlow: { value: new Color() },
      uSunColor: { value: new Color() },
      uSunDir: { value: new Vector3(0, 0.3, -1) },
      uStars: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  )
  useFrame(() => {
    uniforms.uTop.value.copy(live.skyTop)
    uniforms.uMid.value.copy(live.skyMid)
    uniforms.uBottom.value.copy(live.skyBottom)
    uniforms.uGlow.value.copy(live.glow)
    uniforms.uSunColor.value.copy(live.sun)
    uniforms.uSunDir.value.copy(live.dir)
    uniforms.uStars.value = live.stars
    uniforms.uTime.value = live.time
  })
  return (
    <mesh scale={80} renderOrder={-1}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial uniforms={uniforms} vertexShader={skyVertex} fragmentShader={skyFragment} side={BackSide} depthWrite={false} fog={false} />
    </mesh>
  )
}
