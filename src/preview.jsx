import { createRoot } from 'react-dom/client'
import Scene from './scene/Scene'
import { ui } from './lib/store'
import { SHOTS, SECTION_IDS } from './scene/shots'

const q = new URLSearchParams(location.search)
if (q.get('t')) ui.set({ timeMode: q.get('t') })
const shot = q.get('shot') || 'home'
ui.set({ section: Math.max(0, SECTION_IDS.indexOf(shot)) })
const custom = q.get('cam') ? (() => { const v = q.get('cam').split(',').map(Number); return { pos: v.slice(0, 3), target: v.slice(3, 6), fov: v[6] || 50 } })() : null

createRoot(document.getElementById('root')).render(
  <div style={{ position: 'fixed', inset: 0 }}>
    <Scene quality={q.get('q') || 'high'} fixedCamera={custom || SHOTS[shot]} />
  </div>,
)
