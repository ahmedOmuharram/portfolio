import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { NoToneMapping, PCFSoftShadowMap, SRGBColorSpace } from 'three'
import { SkyProvider, SkyDome } from './sky'
import Outside from './Outside'
import Room from './Room'
import Lights from './Lights'
import Effects from './Effects'
import Furniture from './Furniture'
import CameraRig from './CameraRig'

function ReadySignal({ onReady }) {
  const frames = useRef(0)
  useFrame(() => {
    frames.current += 1
    if (frames.current === 4) onReady?.()
  })
  return null
}

export default function Scene({ quality = 'high', fixedCamera, onReady }) {
  return (
    <Canvas
      shadows={quality !== 'low' ? { type: PCFSoftShadowMap } : false}
      dpr={quality === 'high' ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: false, powerPreference: 'high-performance', outputColorSpace: SRGBColorSpace, toneMapping: NoToneMapping, stencil: false }}
      camera={{ fov: 42, near: 0.05, far: 200, position: [2.6, 1.55, 2.8] }}
    >
      <SkyProvider>
        <Suspense fallback={null}>
          <SkyDome />
          <Outside />
          <Room />
          <Furniture quality={quality} />
          <Lights quality={quality} />
          <CameraRig fixed={fixedCamera} />
          <Effects quality={quality} />
          <ReadySignal onReady={onReady} />
        </Suspense>
      </SkyProvider>
    </Canvas>
  )
}
