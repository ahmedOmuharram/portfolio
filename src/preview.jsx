import { createRoot } from 'react-dom/client'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import Scene from './scene/Scene'
import { ui } from './lib/store'
import { SHOTS, SECTION_IDS } from './scene/shots'
import { ARMCHAIR, CREDENZA } from './scene/layout'

const q = new URLSearchParams(location.search)
if (q.get('t')) ui.set({ timeMode: q.get('t') })
const shot = q.get('shot') || 'home'
ui.set({ section: Math.max(0, SECTION_IDS.indexOf(shot)) })
const custom = q.get('cam')
  ? (() => {
      const v = q.get('cam').split(',').map(Number)
      return { pos: v.slice(0, 3), target: v.slice(3, 6), fov: v[6] || 50 }
    })()
  : null

const a = ARMCHAIR.rotation
const SPOTS = {
  cat: [ARMCHAIR.position[0] + Math.sin(a) * 0.08, 0.62, ARMCHAIR.position[2] + Math.cos(a) * 0.08],
  catSill: [-1.0, 1.1, -2.88],
  radio: [CREDENZA.x - 0.02, CREDENZA.height + 0.1, CREDENZA.z - 0.2],
  guitar: [3.05, 0.45, 0.1],
}

function Probe() {
  const camera = useThree((s) => s.camera)
  window.__spots = () => {
    camera.updateMatrixWorld()
    return Object.entries(SPOTS)
      .map(([id, p]) => {
        const v = new Vector3(...p).project(camera)
        return { id, x: (v.x + 1) / 2, y: (1 - v.y) / 2, z: v.z }
      })
      .filter((s) => s.z < 1 && s.x > 0.04 && s.x < 0.96 && s.y > 0.04 && s.y < 0.96)
      .map(({ id, x, y }) => ({ id, x: +x.toFixed(4), y: +y.toFixed(4) }))
  }
  return null
}

createRoot(document.getElementById('root')).render(
  <div style={{ position: 'fixed', inset: 0 }}>
    <Scene quality={q.get('q') || 'high'} fixedCamera={custom || SHOTS[shot]} dpr={q.get('dpr') ? +q.get('dpr') : undefined}>
      <Probe />
    </Scene>
  </div>,
)
