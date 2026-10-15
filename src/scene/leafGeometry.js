import { Path, Shape, ShapeGeometry } from 'three'

function bend(geo, amount = 0.6, cup = 0.4) {
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, y * y * amount + x * x * cup)
  }
  geo.computeVertexNormals()
  return geo
}

const geoCache = {}

export function leafShapeGeometry(kind) {
  if (geoCache[kind]) return geoCache[kind]
  const s = new Shape()
  if (kind === 'monstera') {
    s.moveTo(0, 0)
    s.bezierCurveTo(0.22, -0.02, 0.32, 0.18, 0.3, 0.34)
    s.bezierCurveTo(0.28, 0.5, 0.14, 0.6, 0, 0.62)
    s.bezierCurveTo(-0.14, 0.6, -0.28, 0.5, -0.3, 0.34)
    s.bezierCurveTo(-0.32, 0.18, -0.22, -0.02, 0, 0)
    const holes = [
      [0.16, 0.22, 0.05, 0.022, 0.5],
      [0.18, 0.38, 0.05, 0.02, 0.2],
      [-0.16, 0.24, 0.05, 0.022, -0.5],
      [-0.17, 0.4, 0.05, 0.02, -0.2],
      [0.1, 0.5, 0.035, 0.015, 0.1],
      [-0.1, 0.5, 0.035, 0.015, -0.1],
    ]
    for (const [x, y, rx, ry, rot] of holes) {
      const h = new Path()
      h.absellipse(x, y, rx, ry, 0, Math.PI * 2, false, rot)
      s.holes.push(h)
    }
    geoCache[kind] = bend(new ShapeGeometry(s, 10), 0.35, 0.25)
  } else if (kind === 'heart') {
    s.moveTo(0, 0)
    s.bezierCurveTo(0.07, -0.03, 0.1, 0.05, 0.08, 0.09)
    s.bezierCurveTo(0.06, 0.13, 0.02, 0.15, 0, 0.17)
    s.bezierCurveTo(-0.02, 0.15, -0.06, 0.13, -0.08, 0.09)
    s.bezierCurveTo(-0.1, 0.05, -0.07, -0.03, 0, 0)
    geoCache[kind] = bend(new ShapeGeometry(s, 6), 0.8, 0.8)
  } else if (kind === 'blade') {
    s.moveTo(-0.035, 0)
    s.quadraticCurveTo(-0.05, 0.4, 0, 0.75)
    s.quadraticCurveTo(0.05, 0.4, 0.035, 0)
    s.lineTo(-0.035, 0)
    const g = new ShapeGeometry(s, 8)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setZ(i, -Math.abs(pos.getX(i)) * 0.6)
    g.computeVertexNormals()
    geoCache[kind] = g
  } else {
    s.moveTo(0, 0)
    s.bezierCurveTo(0.06, 0.03, 0.07, 0.16, 0, 0.3)
    s.bezierCurveTo(-0.07, 0.16, -0.06, 0.03, 0, 0)
    geoCache[kind] = bend(new ShapeGeometry(s, 6), 0.5, 1.2)
  }
  return geoCache[kind]
}
