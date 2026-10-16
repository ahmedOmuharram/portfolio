import { ui } from '../lib/store'
import { flick } from '../lib/audio'

const switched = {}

export function toggleLamp(id) {
  const off = { ...ui.get().lampsOff, [id]: !ui.get().lampsOff[id] }
  switched[id] = performance.now() / 1000
  ui.set({ lampsOff: off })
  flick(!off[id])
}

export function lampLevel(id) {
  const off = ui.get().lampsOff[id]
  const at = switched[id]
  if (at === undefined) return off ? 0 : 1
  const age = performance.now() / 1000 - at
  if (off) return Math.max(0, 1 - age / 0.12)
  const k = Math.min(1, age / 0.18)
  return age < 0.18 ? k * (0.75 + 0.25 * Math.sin(age * 140)) : 1
}
