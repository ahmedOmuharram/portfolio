import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '../ThemeProvider'
import { useIsMobile } from '../useIsMobile'
import { Barrel } from './BarrelEffect'

// Ambient drift + grab-to-move. You can drag the whole starfield anywhere that
// isn't a foreground interaction (the hand, the project nodes, a control, etc.).
function Drift({ children }) {
  const ref = useRef()
  const drag = useRef({ x: 0, y: 0, vx: 0, vy: 0, dragging: false, armed: false, px: 0, py: 0, sx: 0, sy: 0 })

  useEffect(() => {
    const isInteractive = (el) =>
      el && el.closest && el.closest('canvas, button, a, input, textarea, select, [role="dialog"], .theme-toggle')

    const onDown = (e) => {
      if (isInteractive(e.target)) return // something else owns this drag
      const d = drag.current
      d.armed = true
      d.dragging = false
      d.px = d.sx = e.clientX
      d.py = d.sy = e.clientY
    }
    const onMove = (e) => {
      const d = drag.current
      if (!d.armed) return
      if (!d.dragging) {
        if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 5) return // allow clicks/selection
        d.dragging = true
        document.body.style.userSelect = 'none'
      }
      const dx = e.clientX - d.px
      const dy = e.clientY - d.py
      d.x += dx * 0.0016
      d.y += dy * 0.0016
      d.vx = dx * 0.0016
      d.vy = dy * 0.0016
      d.px = e.clientX
      d.py = e.clientY
    }
    const onUp = () => {
      const d = drag.current
      d.armed = false
      d.dragging = false
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.body.style.userSelect = ''
    }
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const d = drag.current
    if (!d.dragging) {
      d.x += d.vx
      d.y += d.vy
      d.vx *= 0.93
      d.vy *= 0.93
    }
    d.y = THREE.MathUtils.clamp(d.y, -0.6, 0.6) // don't let it flip over
    ref.current.rotation.y = Math.sin(t * 0.018) * 0.16 + d.x
    ref.current.rotation.x = Math.cos(t * 0.013) * 0.08 + d.y
  })

  return <group ref={ref}>{children}</group>
}

export default function SpaceBackground() {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const isDark = theme === 'dark'

  // A quiet, deep field that recedes: sparse dim stars + a heavy vignette so the
  // edges fall to near-black and the foreground content is always the focus.
  // Kept mounted across themes so it can fade rather than pop.
  return (
    <div className={`space-bg${isDark ? ' is-visible' : ''}`} aria-hidden="true">
      <Canvas
        frameloop={isDark ? 'always' : 'never'}
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={isMobile ? 0.4 : isDark ? 0.6 : 1}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0a0612']} />
        <Drift>
          <Stars radius={140} depth={80} count={1300} factor={2.2} saturation={0} fade speed={0.18} />
        </Drift>
        <EffectComposer>
          <Barrel strength={0.32} />
          <Bloom mipmapBlur intensity={0.32} luminanceThreshold={0.5} luminanceSmoothing={0.5} />
          <Vignette eskil={false} offset={0.18} darkness={1.0} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
