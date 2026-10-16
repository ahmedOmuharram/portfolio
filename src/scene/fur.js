import { CanvasTexture, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, Vector2, Vector3 } from 'three'

export function patchTexture(base, patches, { w = 512, h = 256, seed = 1 } = {}) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  g.fillStyle = base
  g.fillRect(0, 0, w, h)
  let s = seed
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  patches.forEach(({ color, u, v, r, ry = r }) => {
    for (const dx of [-w, 0, w]) {
      const cx = u * w + dx
      const cy = (1 - v) * h
      for (let k = 0; k < 9; k++) {
        const ox = (rnd() - 0.5) * r * w * 0.9
        const oy = (rnd() - 0.5) * ry * h * 0.9
        const rr = r * w * (0.45 + rnd() * 0.35)
        const grad = g.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, rr)
        grad.addColorStop(0, color)
        grad.addColorStop(0.7, color)
        grad.addColorStop(1, color + '00')
        g.fillStyle = grad
        g.save()
        g.translate(cx + ox, cy + oy)
        g.scale(1, ry / r)
        g.translate(-(cx + ox), -(cy + oy))
        g.beginPath()
        g.arc(cx + ox, cy + oy, rr, 0, Math.PI * 2)
        g.fill()
        g.restore()
      }
    }
  })
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  return tex
}

export function skinMaterial(map, tint = '#9a948e') {
  return new MeshStandardMaterial({ map, color: tint, roughness: 0.9 })
}

export function furMaterial(map, { length = 0.2, layers = 14, density = [60, 30], gravity = 0.4 } = {}) {
  const mat = new MeshStandardMaterial({ map, roughness: 0.95 })
  const uniforms = {
    uFurLength: { value: length },
    uLayers: { value: layers },
    uDensity: { value: new Vector2(...density) },
    uGravity: { value: new Vector3(0, -gravity, 0) },
  }
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uFurLength;\nuniform float uLayers;\nuniform vec3 uGravity;\nvarying float vFurH;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nfloat furH = (float(gl_InstanceID) + 1.0) / uLayers;\nvFurH = furH;\ntransformed += objectNormal * uFurLength * furH + uGravity * uFurLength * furH * furH;',
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec2 uDensity;\nvarying float vFurH;')
      .replace(
        '#include <clipping_planes_fragment>',
        [
          '#include <clipping_planes_fragment>',
          'vec2 furG = vMapUv * uDensity;',
          'vec2 furId = floor(furG);',
          'vec2 furF = fract(furG) - 0.5;',
          'float furR = fract(sin(dot(furId, vec2(12.9898, 78.233))) * 43758.5453);',
          'furF += (vec2(fract(furR * 7.13), fract(furR * 3.71)) - 0.5) * 0.35;',
          'if (length(furF) * 2.0 > (1.0 - vFurH * vFurH) * 1.25 || furR < vFurH * 0.85) discard;',
        ].join('\n'),
      )
      .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= mix(0.72, 1.06, vFurH);')
  }
  mat.customProgramCacheKey = () => `fur-${layers}`
  return mat
}

export function mottleTexture(base, colors, { clusters = 14, w = 512, h = 256, seed = 1, focus = null } = {}) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  g.fillStyle = base
  g.fillRect(0, 0, w, h)
  let s = seed
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5
  for (let k = 0; k < clusters; k++) {
    const cu = focus ? focus.u + (rnd() - 0.5) * focus.spread : rnd()
    const cv = focus ? focus.v + (rnd() - 0.5) * focus.spread : rnd()
    const spread = 18 + rnd() * 34
    const color = colors[k % colors.length]
    for (let i = 0; i < 70; i++) {
      const x = cu * w + gauss() * spread
      const y = (1 - cv) * h + gauss() * spread * 0.7
      const r = 2 + rnd() * 6
      g.globalAlpha = 0.55 + rnd() * 0.45
      g.fillStyle = color
      for (const dx of [-w, 0, w]) {
        g.beginPath()
        g.ellipse(x + dx, y, r * 1.6, r, rnd() * Math.PI, 0, Math.PI * 2)
        g.fill()
      }
    }
  }
  g.globalAlpha = 0.5
  for (let i = 0; i < 500; i++) {
    g.fillStyle = colors[i % colors.length]
    g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2)
  }
  g.globalAlpha = 1
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  return tex
}
