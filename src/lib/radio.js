import { ui } from './store'

export const STATIONS = [
  { id: 'rFZHOHl-L8A', name: 'lofi radio' },
  { id: 'Dx5qFachd3A', name: 'late night radio' },
  { id: 'jQPW1e352uY', name: 'chill radio' },
]

const KEY = 'room-volume'

function savedVolume() {
  try {
    const v = Number(localStorage.getItem(KEY))
    return Number.isFinite(v) && localStorage.getItem(KEY) !== null ? Math.min(100, Math.max(0, v)) : 55
  } catch {
    return 55
  }
}

ui.set({ volume: savedVolume() })

export function setVolume(volume) {
  ui.set({ volume })
  try {
    localStorage.setItem(KEY, String(volume))
  } catch {
    return
  }
}

export function toggleRadio() {
  ui.set((s) => ({ radio: !s.radio }))
}

export function nextStation() {
  ui.set((s) => ({ station: (s.station + 1) % STATIONS.length, radio: true }))
}
