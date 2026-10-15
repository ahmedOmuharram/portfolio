import { EffectComposer, Bloom, Vignette, Noise, ToneMapping, N8AO, SMAA } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'

export default function Effects({ quality }) {
  if (quality === 'low') {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.25} darkness={0.7} />
      </EffectComposer>
    )
  }
  return (
    <EffectComposer multisampling={0}>
      <N8AO aoRadius={0.45} intensity={2.2} distanceFalloff={0.6} quality={quality === 'high' ? 'medium' : 'low'} halfRes />
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.82} luminanceSmoothing={0.25} radius={0.75} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.22} darkness={0.7} />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.18} />
      <SMAA />
    </EffectComposer>
  )
}
