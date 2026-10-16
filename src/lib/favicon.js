export const GRID = [
  '.FFFFFFFFFFFFFF.',
  'FSSSSSSSFSSSSSSF',
  'FS*SSSSSFSSSMMSF',
  'FSSSSSSSFSSSMMSF',
  'FSSSSSSSFS*SSSSF',
  'FSSCSCSSFSSSSSSF',
  'FSSCCCSSFSSSSSSF',
  'FSSCCCSSFSSSSSSF',
  'FSCCCCCSFSSSSSSF',
  'FSCCCCCSFSSSSSSF',
  'FSCCCCCSFSSGSSSF',
  'FCCCCCCCFSGGGSSF',
  'FCCCCCCCFGGGGGGF',
  'LLLLLLLLLLLLLLLL',
  'BBBBBBTBBBBBBBBB',
  '.BBBBBTBBBBBBBB.',
]

export const BASE = { B: '#2a211b', F: '#5a3d27', L: '#9a6a42', C: '#0e0c0b', T: '#0e0c0b' }

export const PALETTES = {
  night: { S: '#1b2747', '*': '#e9e3cf', M: '#f1e3b8', G: '#1f3a2a' },
  dawn: { S: '#d78b8f', '*': '#d78b8f', M: '#ffd7a8', G: '#3f6146' },
  day: { S: '#8fc3e6', '*': '#8fc3e6', M: '#fff1b5', G: '#4f8a4d' },
  golden: { S: '#f0a75a', '*': '#f0a75a', M: '#fff0c2', G: '#566b33' },
  dusk: { S: '#6b4a7c', '*': '#e9c9d8', M: '#f7c98f', G: '#2d4433' },
}

export function paint(ctx, phase, scale = 1) {
  const colors = { ...BASE, ...(PALETTES[phase] || PALETTES.night) }
  ctx.clearRect(0, 0, 16 * scale, 16 * scale)
  GRID.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = colors[row[x]]
      if (!c) continue
      ctx.fillStyle = c
      ctx.fillRect(x * scale, y * scale, scale, scale)
    }
  })
}

export function setFavicon(phase) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  paint(ctx, phase, 2)
  const href = canvas.toDataURL('image/png')
  document.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove())
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/png'
  link.href = href
  document.head.appendChild(link)
}
