import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Object3D } from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { useLive } from './live'
import { LAMPS } from './layout'
import { lampLevel } from './lamps'

RectAreaLightUniformsLib.init()

export default function Lights({ quality }) {
  const live = useLive()
  const gl = useThree((s) => s.gl)
  const sun = useRef()
  const hemi = useRef()
  const windowFill = useRef()
  const deskLamp = useRef()
  const floorLamp = useRef()
  const strings = useRef()
  const monitor = useRef()
  const pc = useRef()
  const sunTarget = useMemo(() => {
    const o = new Object3D()
    o.position.set(0, 0.4, -1.2)
    return o
  }, [])
  const deskTarget = useMemo(() => {
    const o = new Object3D()
    o.position.set(...LAMPS.desk.target)
    return o
  }, [])

  useEffect(() => {
    sun.current.target = sunTarget
    deskLamp.current.target = deskTarget
  }, [sunTarget, deskTarget])

  useFrame(() => {
    const lamps = live.lamps
    sun.current.position.copy(sunTarget.position).addScaledVector(live.dir, 14)
    sun.current.color.copy(live.sun)
    sun.current.intensity = live.sunIntensity * live.facing * 3
    hemi.current.color.copy(live.skyMid).lerp(live.ambient, 0.5)
    hemi.current.groundColor.copy(live.hemiGround)
    hemi.current.intensity = 0.55 + live.ambientIntensity * 2.2
    windowFill.current.color.copy(live.skyBottom).lerp(live.skyMid, 0.5)
    windowFill.current.intensity = 2.5 + live.ambientIntensity * 9
    deskLamp.current.intensity = (6 + lamps * 22) * lampLevel('lampDesk')
    floorLamp.current.intensity = lamps * 9 * lampLevel('lampFloor')
    strings.current.intensity = 0.4 + lamps * 2.2
    monitor.current.intensity = 1.6 + lamps * 1.2
    pc.current.intensity = 0.25 + lamps * 0.5
    gl.toneMappingExposure = live.exposure
  })

  const shadowSize = quality === 'high' ? 2048 : 1024

  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight
        ref={sun}
        castShadow={quality !== 'low'}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <primitive object={sunTarget} />
      <primitive object={deskTarget} />
      <rectAreaLight ref={windowFill} width={2.9} height={1.9} position={[-0.1, 1.75, -2.98]} rotation={[0, Math.PI, 0]} />
      <spotLight
        ref={deskLamp}
        position={LAMPS.desk.pos}
        color="#ffb36b"
        angle={0.85}
        penumbra={0.75}
        distance={6}
        decay={2}
        castShadow={quality === 'high'}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      />
      <pointLight ref={floorLamp} position={LAMPS.floor.pos} color="#ffa95e" distance={7} decay={2} />
      <pointLight ref={strings} position={[0, 2.6, -2.5]} color="#ffbd73" distance={5} decay={2} />
      <rectAreaLight ref={monitor} width={0.58} height={0.32} position={[0.7, 1.1, -2.5]} color="#9fc1ff" rotation={[0, Math.PI, 0]} />
      <pointLight ref={pc} position={[2.12, 0.35, -2.2]} color="#7fd6c2" distance={1.6} decay={2} />
    </>
  )
}
