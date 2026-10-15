import { ui } from './store'

export const STATIONS = [
  { id: 'rFZHOHl-L8A', name: 'lofi radio', note: 'beats to relax / study to' },
  { id: 'jfKfPfyJRdk', name: 'lofi hip hop radio', note: 'Lofi Girl' },
  { id: 'HuFYqnbVbzY', name: 'jazz lofi radio', note: 'Lofi Girl' },
]

export function toggleRadio() {
  ui.set((s) => ({ radio: !s.radio }))
}

export function nextStation() {
  ui.set((s) => ({ station: (s.station + 1) % STATIONS.length, radio: true }))
}
