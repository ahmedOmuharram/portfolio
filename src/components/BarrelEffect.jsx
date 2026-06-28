import { forwardRef, useMemo } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'

// Convex CRT barrel done in the shader (the correct place — screen-space, after
// the scene renders, so it never moves a 3D object's actual position).
//
// Math: for output uv, sample from
//   p = 0.5 + c * (1 + k·r²) / (1 + k·rCorner²),   c = uv-0.5,  r² = |c|²
// The (1 + k·r²) term magnifies the centre (the bulge). Dividing by the value of
// that term AT THE CORNER (rCorner² = 0.5) is the overscan: it pins the corners
// exactly to the frame, so the image always fills the screen — no shrunk corners.
const fragmentShader = /* glsl */ `
  uniform float strength;

  void mainUv(inout vec2 uv) {
    vec2 c = uv - 0.5;
    float r2 = dot(c, c);
    float overscan = 1.0 + strength * 0.5; // value of (1 + k·r²) at the corner
    uv = 0.5 + c * (1.0 + strength * r2) / overscan;
  }
`

class BarrelEffectImpl extends Effect {
  constructor({ strength = 0.4 } = {}) {
    super('BarrelEffect', fragmentShader, {
      uniforms: new Map([['strength', new Uniform(strength)]]),
    })
  }
}

export const Barrel = forwardRef(function Barrel({ strength = 0.4 }, ref) {
  const effect = useMemo(() => new BarrelEffectImpl({ strength }), [strength])
  return <primitive ref={ref} object={effect} dispose={null} />
})
