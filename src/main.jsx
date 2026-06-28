import { createRoot } from 'react-dom/client'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './ThemeProvider.jsx'

// Warm the tower model into cache so the lazily-mounted Contact canvas shows it
// instantly. Kept in the entry (not the component) so editing the tower still
// hot-reloads instead of full-reloading.
useLoader.preload(GLTFLoader, '/models/satellite_tower.glb')

// NOTE: intentionally NOT wrapped in <StrictMode>. This app mounts five WebGL
// canvases (galaxy, hand, brain, projects, tower); StrictMode's dev-only
// double-mount makes each Canvas create → dispose → recreate its WebGL context,
// which transiently doubles the live-context count and drops the last canvas's
// context (the tower) — leaving it frozen so no edit ever appears to take. This
// matches production, which never runs StrictMode.
createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
)
