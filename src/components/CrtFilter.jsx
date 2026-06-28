import { useState } from 'react'
import { useTheme } from '../ThemeProvider'
import { useIsMobile } from '../useIsMobile'

// Screen-space barrel for the DOM/section content via an SVG displacement map.
//
// feDisplacementMap samples:  out(p) = in(p + scale·(channel - 0.5))
// We bake a CONVEX barrel WITH overscan into the map so that:
//   • displacement is 0 at the centre AND at the corners  → corners stay pinned to
//     the frame (no shrunk corners), the interior bows outward (the CRT bulge),
//   • the field is smooth and applied uniformly, so a section's text, panels and
//     3D all move together — it reads as a curved screen, never as an off-centre
//     object. There is NO scaling, which is what shifted objects before.
//
// Per channel:  d = c · (r² − 0.5),  c = uv − 0.5,  r² = |c|²   (corner r² = 0.5)
function makeBarrelMap(size = 256) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const ctx = cv.getContext('2d')
  const img = ctx.createImageData(size, size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = x / (size - 1) - 0.5
      const cy = y / (size - 1) - 0.5
      const f = cx * cx + cy * cy - 0.5 // r² − 0.5  (zero at the corners)
      const i = (y * size + x) * 4
      img.data[i] = Math.max(0, Math.min(255, 128 + cx * f * 900))
      img.data[i + 1] = Math.max(0, Math.min(255, 128 + cy * f * 900))
      img.data[i + 2] = 128
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return cv.toDataURL()
}

export default function CrtFilter() {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  // Build the displacement map synchronously so #crtBarrel exists on the very
  // first paint. If it's created later (in an effect), a section that is hidden
  // at load (the deck's non-active layers) references a filter that doesn't yet
  // exist, and Chrome won't repaint that layer once the filter appears — so it
  // renders wrong (e.g. the contact tower) until a theme toggle forces a repaint.
  const [map] = useState(() => makeBarrelMap())

  // Off on phones — the per-frame SVG filter over animated canvases is too heavy
  // there; the background's WebGL barrel shader still gives the curve on mobile.
  if (theme !== 'dark' || isMobile || !map) return null
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
      <filter id="crtBarrel" x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
        <feImage href={map} result="map" preserveAspectRatio="none" x="0" y="0" width="100%" height="100%" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="90" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}
