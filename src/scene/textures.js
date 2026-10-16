import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

const cache = new Map()

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function finish(c, { repeat = [1, 1], srgb = true } = {}) {
  const t = new CanvasTexture(c)
  if (srgb) t.colorSpace = SRGBColorSpace
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.anisotropy = 8
  return t
}

function memo(key, make) {
  if (!cache.has(key)) cache.set(key, make())
  return cache.get(key)
}

export function floorTexture() {
  return memo('floor', () => {
    const [c, g] = canvas(1024, 1024)
    const r = rng(7)
    const planks = 8
    const h = c.height / planks
    for (let i = 0; i < planks; i++) {
      let x = -r() * 400
      while (x < c.width) {
        const len = 260 + r() * 360
        const tone = 0.82 + r() * 0.3
        const base = [92 * tone, 58 * tone, 38 * tone]
        g.fillStyle = `rgb(${base.map((v) => v | 0).join(',')})`
        g.fillRect(x, i * h, len, h)
        for (let k = 0; k < 26; k++) {
          const y = i * h + r() * h
          g.strokeStyle = `rgba(${r() > 0.5 ? '40,24,14' : '140,96,62'},${0.06 + r() * 0.1})`
          g.lineWidth = 0.6 + r() * 1.4
          g.beginPath()
          g.moveTo(x, y)
          g.bezierCurveTo(x + len * 0.3, y + (r() - 0.5) * 6, x + len * 0.7, y + (r() - 0.5) * 6, x + len, y + (r() - 0.5) * 4)
          g.stroke()
        }
        g.fillStyle = 'rgba(20,12,8,0.75)'
        g.fillRect(x, i * h, 2, h)
        x += len
      }
      g.fillStyle = 'rgba(18,10,6,0.85)'
      g.fillRect(0, i * h, c.width, 2)
    }
    return finish(c, { repeat: [2.2, 2.2] })
  })
}

export function woodTexture(seed = 3, tint = [120, 78, 50]) {
  return memo(`wood-${seed}-${tint}`, () => {
    const [c, g] = canvas(512, 512)
    const r = rng(seed)
    g.fillStyle = `rgb(${tint.join(',')})`
    g.fillRect(0, 0, 512, 512)
    for (let k = 0; k < 140; k++) {
      const y = r() * 512
      g.strokeStyle = `rgba(${r() > 0.5 ? '45,26,14' : '170,120,80'},${0.05 + r() * 0.12})`
      g.lineWidth = 0.5 + r() * 2
      g.beginPath()
      g.moveTo(0, y)
      g.bezierCurveTo(170, y + (r() - 0.5) * 14, 340, y + (r() - 0.5) * 14, 512, y + (r() - 0.5) * 8)
      g.stroke()
    }
    return finish(c)
  })
}

export function plasterTexture(hex = '#24362d', seed = 11) {
  return memo(`plaster-${hex}-${seed}`, () => {
    const [c, g] = canvas(512, 512)
    const r = rng(seed)
    g.fillStyle = hex
    g.fillRect(0, 0, 512, 512)
    for (let k = 0; k < 9000; k++) {
      const v = r() > 0.5 ? 255 : 0
      g.fillStyle = `rgba(${v},${v},${v},${r() * 0.035})`
      const s = 1 + r() * 3
      g.fillRect(r() * 512, r() * 512, s, s)
    }
    for (let k = 0; k < 40; k++) {
      const grd = g.createRadialGradient(r() * 512, r() * 512, 0, r() * 512, r() * 512, 60 + r() * 120)
      grd.addColorStop(0, `rgba(0,0,0,${r() * 0.05})`)
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = grd
      g.fillRect(0, 0, 512, 512)
    }
    return finish(c, { repeat: [2, 1] })
  })
}

export function rugTexture() {
  return memo('rug', () => {
    const [c, g] = canvas(512, 768)
    g.fillStyle = '#5a3326'
    g.fillRect(0, 0, 512, 768)
    g.strokeStyle = '#b8935e'
    g.lineWidth = 10
    g.strokeRect(26, 26, 460, 716)
    g.strokeStyle = '#2c3a3a'
    g.lineWidth = 18
    g.strokeRect(54, 54, 404, 660)
    g.fillStyle = '#2b3b46'
    for (let i = 0; i < 6; i++) {
      g.save()
      g.translate(256, 150 + i * 94)
      g.rotate(Math.PI / 4)
      g.fillRect(-26, -26, 52, 52)
      g.restore()
    }
    g.strokeStyle = '#c99a5b'
    g.lineWidth = 3
    for (let i = 0; i < 6; i++) {
      g.save()
      g.translate(256, 150 + i * 94)
      g.rotate(Math.PI / 4)
      g.strokeRect(-40, -40, 80, 80)
      g.restore()
    }
    const r = rng(5)
    for (let k = 0; k < 14000; k++) {
      g.fillStyle = `rgba(0,0,0,${r() * 0.08})`
      g.fillRect(r() * 512, r() * 768, 2, 2)
    }
    return finish(c)
  })
}

export function corkTexture() {
  return memo('cork', () => {
    const [c, g] = canvas(512, 512)
    const r = rng(21)
    g.fillStyle = '#9a6b42'
    g.fillRect(0, 0, 512, 512)
    for (let k = 0; k < 16000; k++) {
      const v = r()
      g.fillStyle = v > 0.5 ? `rgba(60,34,16,${r() * 0.35})` : `rgba(210,160,110,${r() * 0.25})`
      g.fillRect(r() * 512, r() * 512, 1 + r() * 3, 1 + r() * 3)
    }
    return finish(c)
  })
}

function wrap(g, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  const words = text.split(' ')
  let line = ''
  let lines = 0
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (g.measureText(test).width > maxWidth && line) {
      g.fillText(line, x, y)
      y += lineHeight
      lines += 1
      if (lines >= maxLines) return y
      line = w
    } else {
      line = test
    }
  }
  if (line) g.fillText(line, x, y)
  return y + lineHeight
}

export function noteTexture({ title, subtitle, meta, paper = '#efe6d2', ink = '#2a221b', accent = '#b5523b', seed = 1 }) {
  return memo(`note-${title}-${subtitle}-${paper}`, () => {
    const [c, g] = canvas(512, 420)
    const r = rng(seed)
    g.fillStyle = paper
    g.fillRect(0, 0, 512, 420)
    for (let k = 0; k < 3000; k++) {
      g.fillStyle = `rgba(80,60,30,${r() * 0.05})`
      g.fillRect(r() * 512, r() * 420, 2, 2)
    }
    g.fillStyle = accent
    g.font = '26px "DotGothic16", monospace'
    g.fillText(meta || '', 34, 64)
    g.fillStyle = ink
    g.font = '600 46px "Pixelify Sans", sans-serif'
    const y = wrap(g, title, 34, 134, 444, 52, 3)
    g.font = '30px "DotGothic16", sans-serif'
    g.fillStyle = 'rgba(42,34,27,0.8)'
    wrap(g, subtitle || '', 34, y + 10, 444, 38, 3)
    return finish(c)
  })
}

export function polaroidTexture(src, caption) {
  return memo(`polaroid-${src}`, () => {
    const [c, g] = canvas(400, 470)
    g.fillStyle = '#f3efe6'
    g.fillRect(0, 0, 400, 470)
    g.fillStyle = '#1d1d1d'
    g.fillRect(24, 24, 352, 352)
    const tex = finish(c)
    const img = new Image()
    img.onload = () => {
      const s = Math.max(352 / img.width, 352 / img.height)
      const w = img.width * s
      const h = img.height * s
      g.save()
      g.beginPath()
      g.rect(24, 24, 352, 352)
      g.clip()
      g.filter = 'sepia(0.45) saturate(0.8) contrast(1.05) brightness(0.82)'
      g.drawImage(img, 24 + (352 - w) / 2, 24 + (352 - h) / 2, w, h)
      g.filter = 'none'
      const v = g.createRadialGradient(200, 200, 60, 200, 200, 260)
      v.addColorStop(0, 'rgba(40,20,10,0)')
      v.addColorStop(1, 'rgba(40,20,10,0.55)')
      g.fillStyle = v
      g.fillRect(24, 24, 352, 352)
      g.fillStyle = 'rgba(255,170,90,0.12)'
      g.fillRect(24, 24, 352, 352)
      g.restore()
      tex.needsUpdate = true
    }
    img.src = src
    g.fillStyle = '#3a3128'
    g.font = '500 30px "Pixelify Sans", sans-serif'
    g.textAlign = 'center'
    g.fillText(caption, 200, 432)
    return tex
  })
}

export function paperTexture(lines) {
  return memo(`paper-${lines[0]}`, () => {
    const [c, g] = canvas(512, 680)
    g.fillStyle = '#f2ece0'
    g.fillRect(0, 0, 512, 680)
    g.fillStyle = '#2b2620'
    g.textAlign = 'center'
    g.font = '20px "DotGothic16", monospace'
    g.fillText('master’s thesis · penn · 2026', 256, 70)
    g.font = '600 34px "Pixelify Sans", sans-serif'
    let y = wrap(g, lines[0], 256, 140, 420, 42)
    g.font = '24px "DotGothic16", sans-serif'
    y = wrap(g, lines[1], 256, y + 16, 420, 30)
    g.textAlign = 'left'
    g.fillStyle = 'rgba(43,38,32,0.35)'
    for (let i = 0; i < 16; i++) {
      const w = 300 + ((i * 37) % 120)
      g.fillRect(56, y + 40 + i * 22, w, 6)
    }
    return finish(c)
  })
}

export function spineTexture() {
  return memo('spines', () => {
    const [c, g] = canvas(64, 256)
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 64, 256)
    g.fillStyle = 'rgba(0,0,0,0.18)'
    g.fillRect(0, 24, 64, 6)
    g.fillRect(0, 226, 64, 6)
    g.fillStyle = 'rgba(255,255,255,0.5)'
    g.fillRect(10, 60, 44, 4)
    g.fillRect(14, 72, 36, 3)
    g.fillStyle = 'rgba(0,0,0,0.12)'
    g.fillRect(0, 0, 6, 256)
    return finish(c)
  })
}

export function vinylLabelTexture() {
  return memo('vinyl', () => {
    const [c, g] = canvas(256, 256)
    g.fillStyle = '#0c0c0c'
    g.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = `rgba(255,255,255,${0.02 + (i % 3) * 0.015})`
      g.beginPath()
      g.arc(128, 128, 50 + i * 1.9, 0, Math.PI * 2)
      g.stroke()
    }
    g.fillStyle = '#c4553a'
    g.beginPath()
    g.arc(128, 128, 44, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#f0dcc0'
    g.font = '600 15px "Pixelify Sans", sans-serif'
    g.textAlign = 'center'
    g.fillText('late night', 128, 122)
    g.font = '10px "DotGothic16", monospace'
    g.fillText('side a', 128, 140)
    g.fillStyle = '#111'
    g.beginPath()
    g.arc(128, 128, 3, 0, Math.PI * 2)
    g.fill()
    return finish(c)
  })
}

export function leafTexture() {
  return memo('leaf', () => {
    const [c, g] = canvas(128, 256)
    const grd = g.createLinearGradient(0, 0, 128, 0)
    grd.addColorStop(0, '#9aa88a')
    grd.addColorStop(0.5, '#ffffff')
    grd.addColorStop(1, '#9aa88a')
    g.fillStyle = grd
    g.fillRect(0, 0, 128, 256)
    g.strokeStyle = 'rgba(40,60,30,0.35)'
    g.lineWidth = 3
    g.beginPath()
    g.moveTo(64, 256)
    g.lineTo(64, 0)
    g.stroke()
    g.lineWidth = 1.5
    for (let i = 0; i < 9; i++) {
      const y = 230 - i * 24
      g.beginPath()
      g.moveTo(64, y)
      g.quadraticCurveTo(40, y - 14, 8, y - 30)
      g.moveTo(64, y)
      g.quadraticCurveTo(88, y - 14, 120, y - 30)
      g.stroke()
    }
    return finish(c)
  })
}
