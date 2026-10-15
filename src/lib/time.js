const env = import.meta.env

export const TIMEZONE = env.VITE_TIMEZONE || 'Africa/Cairo'
export const CITY = env.VITE_CITY || 'Cairo'
const LAT = Number(env.VITE_LATITUDE ?? 30.04)
const LON = Number(env.VITE_LONGITUDE ?? 31.24)

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

export function zonedNow(date = new Date()) {
  const parts = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]))
  const year = Number(parts.year)
  const month = Number(parts.month)
  const day = Number(parts.day)
  const hour = Number(parts.hour)
  const minute = Number(parts.minute)
  const second = Number(parts.second)
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second)
  const offset = Math.round((asUtc - date.getTime()) / 60000) / 60
  const doy = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 864e5)
  return { year, month, day, hour, minute, offset, doy, decimal: hour + minute / 60 + second / 3600 }
}

export function sunWindow(doy, offset) {
  const decl = (-23.44 * Math.cos(((2 * Math.PI) / 365) * (doy + 10)) * Math.PI) / 180
  const phi = (LAT * Math.PI) / 180
  const x = Math.min(1, Math.max(-1, -Math.tan(phi) * Math.tan(decl)))
  const half = (Math.acos(x) * 12) / Math.PI
  const noon = 12 + offset - LON / 15
  const maxElevation = 90 - Math.abs(LAT - (decl * 180) / Math.PI)
  return { sunrise: noon - half, sunset: noon + half, noon, maxElevation }
}

const palettes = {
  night: {
    skyTop: '#060a1a',
    skyMid: '#111a36',
    skyBottom: '#1c2444',
    glow: '#2a2a52',
    sun: '#8ea6ff',
    sunIntensity: 0.55,
    ambient: '#1a2033',
    ambientIntensity: 0.32,
    hemiGround: '#120d0a',
    lamps: 1,
    stars: 1,
    city: 1,
    foliage: '#0b1712',
    foliageLit: '#16271d',
    fog: '#0a0e1a',
    exposure: 1.0,
    fireflies: 1,
  },
  dawn: {
    skyTop: '#26345e',
    skyMid: '#7a6a96',
    skyBottom: '#f0a982',
    glow: '#ffb58a',
    sun: '#ffb487',
    sunIntensity: 1.4,
    ambient: '#4a4560',
    ambientIntensity: 0.55,
    hemiGround: '#2a1d16',
    lamps: 0.55,
    stars: 0.15,
    city: 0.35,
    foliage: '#1e3328',
    foliageLit: '#3b5a3c',
    fog: '#6f6280',
    exposure: 1.05,
    fireflies: 0,
  },
  day: {
    skyTop: '#3f74b5',
    skyMid: '#86b1d8',
    skyBottom: '#d6e6ea',
    glow: '#fff3d6',
    sun: '#fff0d4',
    sunIntensity: 3.2,
    ambient: '#a9bcc0',
    ambientIntensity: 1.25,
    hemiGround: '#3a2c20',
    lamps: 0,
    stars: 0,
    city: 0,
    foliage: '#2f5a33',
    foliageLit: '#5f8f4a',
    fog: '#a9c3cf',
    exposure: 1.12,
    fireflies: 0,
  },
  golden: {
    skyTop: '#3d5d99',
    skyMid: '#c98f78',
    skyBottom: '#ffbe73',
    glow: '#ffb25c',
    sun: '#ffa552',
    sunIntensity: 3.0,
    ambient: '#8a6f62',
    ambientIntensity: 0.7,
    hemiGround: '#3a2416',
    lamps: 0.35,
    stars: 0,
    city: 0.1,
    foliage: '#2c4527',
    foliageLit: '#8a8a3c',
    fog: '#d9a67c',
    exposure: 1.02,
    fireflies: 0,
  },
  dusk: {
    skyTop: '#121a40',
    skyMid: '#47417a',
    skyBottom: '#c76e6a',
    glow: '#f0845f',
    sun: '#ff8a66',
    sunIntensity: 0.9,
    ambient: '#3a3352',
    ambientIntensity: 0.45,
    hemiGround: '#1d120e',
    lamps: 1,
    stars: 0.45,
    city: 0.8,
    foliage: '#122019',
    foliageLit: '#2a3326',
    fog: '#3a3158',
    exposure: 1.0,
    fireflies: 0.6,
  },
}

export const PRESETS = [
  { id: 'live', label: 'Live' },
  { id: 'dawn', label: 'Dawn' },
  { id: 'day', label: 'Day' },
  { id: 'golden', label: 'Golden hour' },
  { id: 'dusk', label: 'Dusk' },
  { id: 'night', label: 'Night' },
]

function keyframes({ sunrise, sunset }) {
  return [
    [sunrise - 1.4, 'night'],
    [sunrise - 0.2, 'dawn'],
    [sunrise + 1.6, 'day'],
    [sunset - 2.2, 'day'],
    [sunset - 0.7, 'golden'],
    [sunset + 0.35, 'dusk'],
    [sunset + 1.5, 'night'],
  ]
}

export function presetHour(id, win) {
  if (id === 'dawn') return win.sunrise
  if (id === 'day') return win.noon - 1.5
  if (id === 'golden') return win.sunset - 0.75
  if (id === 'dusk') return win.sunset + 0.4
  if (id === 'night') return (win.sunset + 24 + win.sunrise) / 2 % 24
  return null
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mixHex(a, b, t) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

function mixPalette(a, b, t) {
  const out = {}
  for (const key of Object.keys(a)) {
    const va = a[key]
    const vb = b[key]
    out[key] = typeof va === 'number' ? va + (vb - va) * t : mixHex(va, vb, t)
  }
  return out
}

function smooth(t) {
  return t * t * (3 - 2 * t)
}

export function skyState(hour, win) {
  const frames = keyframes(win)
  let h = hour
  if (h < frames[0][0]) h += 24
  let a = frames[frames.length - 1]
  let b = [frames[0][0] + 24, frames[0][1]]
  for (let i = 0; i < frames.length - 1; i++) {
    if (h >= frames[i][0] && h < frames[i + 1][0]) {
      a = frames[i]
      b = frames[i + 1]
      break
    }
  }
  const t = b[0] === a[0] ? 0 : smooth(Math.min(1, Math.max(0, (h - a[0]) / (b[0] - a[0]))))
  const palette = mixPalette(palettes[a[1]], palettes[b[1]], t)

  const dayLength = win.sunset - win.sunrise
  const p = (hour - win.sunrise) / dayLength
  const isDay = p > -0.04 && p < 1.04
  let dir
  if (isDay) {
    const elev = Math.max(0.03, Math.sin(Math.min(1, Math.max(0, p)) * Math.PI)) * (win.maxElevation * Math.PI) / 180
    const az = (150 - 175 * p) * (Math.PI / 180)
    dir = [Math.sin(az) * Math.cos(elev), Math.sin(elev), -Math.cos(az) * Math.cos(elev)]
  } else {
    const nightLen = 24 - dayLength
    let q = (hour - win.sunset) / nightLen
    if (q < 0) q += 24 / nightLen
    const elev = 0.16 + 0.16 * Math.sin(Math.min(1, Math.max(0, q)) * Math.PI)
    const az = (24 - 40 * q) * (Math.PI / 180)
    dir = [Math.sin(az) * Math.cos(elev), Math.sin(elev), -Math.cos(az) * Math.cos(elev)]
  }
  const facing = Math.max(0, Math.min(1, (-dir[2] - 0.05) * 3))
  return { ...palette, dir, isDay, facing, phase: t < 0.5 ? a[1] : b[1], hour }
}

export function formatClock(hour) {
  const h = Math.floor(((hour % 24) + 24) % 24)
  const m = Math.floor((hour - Math.floor(hour)) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
