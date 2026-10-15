import { CanvasTexture, SRGBColorSpace } from 'three'

const SCRIPT = [
  { p: true, t: 'whoami' },
  { t: 'ahmed muharram — ai/ml engineer · systems · scientific llm agents' },
  { p: true, t: 'cat now.txt' },
  { t: 'r&d software developer @ orascom construction' },
  { t: 'listening: lofi + jazz · drinking: coffee · cats: asleep' },
  { p: true, t: 'ls ~/projects' },
  { t: 'pathfinder/  lamina/  sceniq/  bytenet/  instalite/  pennos/' },
  { t: 'mini-minecraft/  rv32im/  prodosphere/  btc-sentiment/' },
  { p: true, t: 'python -m pathfinder --ask "kinases upregulated in P. falciparum"' },
  { t: '→ scoping · discovery · planning · execution · verification' },
  { t: '✓ strategy graph compiled (7 steps, 3 ortholog transforms)' },
  { p: true, t: 'git commit -m "late night, small fixes"' },
  { t: '[main 4f2c1a9] late night, small fixes' },
]

export function createTerminal() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 600
  const g = canvas.getContext('2d')
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8

  let line = 0
  let char = 0
  let wait = 0
  let blink = 0
  const done = []

  function draw() {
    const grd = g.createLinearGradient(0, 0, 0, 600)
    grd.addColorStop(0, '#0e1513')
    grd.addColorStop(1, '#0a0f0e')
    g.fillStyle = grd
    g.fillRect(0, 0, 1024, 600)
    g.fillStyle = 'rgba(255,255,255,0.04)'
    g.fillRect(0, 0, 1024, 34)
    ;['#e0705a', '#e3b55b', '#7fb685'].forEach((c, i) => {
      g.fillStyle = c
      g.beginPath()
      g.arc(24 + i * 22, 17, 6, 0, Math.PI * 2)
      g.fill()
    })
    g.fillStyle = 'rgba(236,228,214,0.45)'
    g.font = '18px "JetBrains Mono", monospace'
    g.fillText('~/late-night — zsh', 430, 23)
    g.font = '21px "JetBrains Mono", monospace'
    const rows = [...done]
    const cur = SCRIPT[line]
    if (cur) rows.push({ ...cur, t: cur.t.slice(0, char), live: true })
    const visible = rows.slice(-17)
    visible.forEach((r, i) => {
      const y = 70 + i * 30
      let x = 22
      if (r.p) {
        g.fillStyle = '#e8a85a'
        g.fillText('ahmed@muharram', x, y)
        x += g.measureText('ahmed@muharram').width
        g.fillStyle = '#8fb39a'
        g.fillText(' ~ $ ', x, y)
        x += g.measureText(' ~ $ ').width
        g.fillStyle = '#ece4d6'
      } else {
        g.fillStyle = r.t.startsWith('✓') ? '#9fd4a8' : 'rgba(236,228,214,0.68)'
      }
      g.fillText(r.t, x, y)
      if (r.live && blink % 2 === 0) {
        const w = g.measureText(r.t).width
        g.fillStyle = '#ece4d6'
        g.fillRect(x + w + 2, y - 18, 11, 22)
      }
    })
    texture.needsUpdate = true
  }

  function tick() {
    blink += 1
    if (wait > 0) {
      wait -= 1
      draw()
      return
    }
    const cur = SCRIPT[line]
    if (!cur) {
      done.length = 0
      line = 0
      char = 0
      wait = 6
      draw()
      return
    }
    if (cur.p && char < cur.t.length) {
      char += 1 + (Math.random() < 0.3 ? 1 : 0)
      char = Math.min(char, cur.t.length)
    } else if (!cur.p) {
      char = cur.t.length
    }
    if (char >= cur.t.length) {
      done.push(cur)
      line += 1
      char = 0
      wait = cur.p ? 4 : 2
      if (line >= SCRIPT.length) wait = 26
    }
    draw()
  }

  draw()
  return { texture, tick }
}
