import { useTheme } from '../ThemeProvider'

// A brief dip-to-colour veil that masks the 3D/CRT snap when toggling themes,
// so the switch reads as an animated transition rather than an instant flip.
export default function ThemeVeil() {
  const { transitioning } = useTheme()
  return (
    <div
      className={`theme-veil${transitioning ? ' is-active' : ''}`}
      aria-hidden="true"
    />
  )
}
