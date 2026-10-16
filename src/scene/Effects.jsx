import { EffectComposer, Bloom, Vignette, Noise, ToneMapping, N8AO, SMAA } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'

export default function Effects({ quality, grain = true, ao = true }) {
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
      {ao && <N8AO aoRadius={0.35} intensity={1.5} distanceFalloff={0.6} quality={quality === 'high' ? 'high' : 'medium'} denoiseRadius={14} halfRes={quality !== 'high'} />}
      <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.85} luminanceSmoothing={0.35} radius={0.75} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.22} darkness={0.7} />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={grain ? 0.1 : 0} />
      <SMAA />
    </EffectComposer>
  )
}
