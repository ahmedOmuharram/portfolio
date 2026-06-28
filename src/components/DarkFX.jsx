import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

/**
 * Shared dark-mode 3D treatment: a starfield + bloom + vignette.
 * Only render this inside an OPAQUE canvas (it composites to the framebuffer,
 * which can flatten alpha). For transparent overlay canvases, glow with CSS instead.
 */
export default function DarkFX({
  stars = 1500,
  starRadius = 60,
  bloom = 0.55,
  threshold = 0.35,
  smoothing = 0.4,
  vignetteDarkness = 0.7,
}) {
  return (
    <>
      {stars > 0 && (
        <Stars
          radius={starRadius}
          depth={50}
          count={stars}
          factor={3}
          saturation={0}
          fade
          speed={0.5}
        />
      )}
      <EffectComposer>
        <Bloom mipmapBlur intensity={bloom} luminanceThreshold={threshold} luminanceSmoothing={smoothing} />
        <Vignette eskil={false} offset={0.28} darkness={vignetteDarkness} />
      </EffectComposer>
    </>
  )
}
