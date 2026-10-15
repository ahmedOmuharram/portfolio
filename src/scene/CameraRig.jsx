import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { easing } from 'maath'
import { ui } from '../lib/store'
import { SHOTS, SECTION_IDS } from './shots'

export default function CameraRig({ fixed }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const look = useRef(new Vector3())
  const goalPos = useMemo(() => new Vector3(), [])
  const goalTarget = useMemo(() => new Vector3(), [])
  const back = useMemo(() => new Vector3(), [])
  const pointer = useRef({ x: 0, y: 0 })
  const primed = useRef(false)
  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  useEffect(() => {
    const move = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useFrame((state, delta) => {
    const shot = fixed || SHOTS[SECTION_IDS[ui.get().section]] || SHOTS.home
    const narrow = size.width < size.height
    goalPos.set(...shot.pos)
    goalTarget.set(...shot.target)
    if (narrow) {
      back.copy(goalPos).sub(goalTarget).normalize()
      goalPos.addScaledVector(back, 0.9)
    }
    const fov = shot.fov || 42
    if (!fixed && !reduced) {
      const t = state.clock.elapsedTime
      goalPos.x += Math.sin(t * 0.21) * 0.025 + pointer.current.x * 0.06
      goalPos.y += Math.sin(t * 0.33) * 0.015 - pointer.current.y * 0.035
      goalTarget.x += pointer.current.x * 0.08
    }
    if (!primed.current || fixed || reduced) {
      camera.position.copy(goalPos)
      look.current.copy(goalTarget)
      camera.fov = fov
      camera.updateProjectionMatrix()
      primed.current = true
    } else {
      easing.damp3(camera.position, goalPos, 0.85, delta)
      easing.damp3(look.current, goalTarget, 0.7, delta)
      if (Math.abs(camera.fov - fov) > 0.01) {
        easing.damp(camera, 'fov', fov, 0.8, delta)
        camera.updateProjectionMatrix()
      }
    }
    camera.lookAt(look.current)
  })

  return null
}
