import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GRID, BASE, PALETTES } from '../src/lib/favicon.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, process.argv[2] || 'public/favicons')
const phase = process.argv[3] || 'night'
mkdirSync(out, { recursive: true })

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function hex(c) {
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
}

function render(size, { pad = 0, bg = null } = {}) {
  const colors = { ...BASE, ...PALETTES[phase] }
  const cell = Math.floor((size - pad * 2) / 16)
  const offset = Math.floor((size - cell * 16) / 2)
  const px = Buffer.alloc(size * size * 4)
  if (bg) {
    const [r, g, b] = hex(bg)
    for (let i = 0; i < size * size; i++) px.set([r, g, b, 255], i * 4)
  }
  GRID.forEach((row, gy) => {
    for (let gx = 0; gx < 16; gx++) {
      const c = colors[row[gx]]
      if (!c) continue
      const [r, g, b] = hex(c)
      for (let y = 0; y < cell; y++)
        for (let x = 0; x < cell; x++) px.set([r, g, b, 255], ((offset + gy * cell + y) * size + offset + gx * cell + x) * 4)
    }
  })
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr.set([8, 6, 0, 0, 0], 8)
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

function ico(images) {
  const head = Buffer.alloc(6 + images.length * 16)
  head.writeUInt16LE(0, 0)
  head.writeUInt16LE(1, 2)
  head.writeUInt16LE(images.length, 4)
  let offset = head.length
  images.forEach(({ size, png }, i) => {
    const e = 6 + i * 16
    head.writeUInt8(size % 256, e)
    head.writeUInt8(size % 256, e + 1)
    head.writeUInt16LE(1, e + 4)
    head.writeUInt16LE(32, e + 6)
    head.writeUInt32LE(png.length, e + 8)
    head.writeUInt32LE(offset, e + 12)
    offset += png.length
  })
  return Buffer.concat([head, ...images.map((i) => i.png)])
}

const files = {
  'favicon-16x16.png': render(16),
  'favicon-32x32.png': render(32),
  'favicon-48x48.png': render(48),
  'apple-touch-icon.png': render(180, { pad: 10, bg: BASE.B }),
  'android-chrome-192x192.png': render(192, { pad: 16, bg: BASE.B }),
  'android-chrome-512x512.png': render(512, { pad: 48, bg: BASE.B }),
}
for (const [name, buf] of Object.entries(files)) writeFileSync(resolve(out, name), buf)
writeFileSync(resolve(out, 'favicon.ico'), ico([16, 32, 48].map((size) => ({ size, png: files[`favicon-${size}x${size}.png`] }))))
console.log('wrote', Object.keys(files).length + 1, 'files to', out)
