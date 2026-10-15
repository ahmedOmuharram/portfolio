import { lazy, Suspense, useEffect, useState } from 'react'
import Mobile from './ui/Mobile'

const Desktop = lazy(() => import('./ui/Desktop'))

function hasWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

function detect() {
  const params = new URLSearchParams(window.location.search)
  const forced = params.get('mode')
  const q = params.get('q')
  if (forced === '2d') return { mode: '2d' }
  if (forced === '3d') return { mode: '3d', quality: ['low', 'medium', 'high'].includes(q) ? q : 'high' }
  const small = window.matchMedia('(max-width: 900px)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const saveData = navigator.connection?.saveData
  if (small || saveData || (coarse && window.innerWidth < 1200) || !hasWebGL2()) return { mode: '2d' }
  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory || 8
  return { mode: '3d', quality: cores <= 4 || memory <= 4 ? 'medium' : 'high' }
}

export default function App() {
  const [env, setEnv] = useState(detect)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const change = () => setEnv(detect())
    mq.addEventListener('change', change)
    return () => mq.removeEventListener('change', change)
  }, [])
  if (env.mode === '2d') return <Mobile />
  return (
    <Suspense fallback={null}>
      <Desktop quality={env.quality} />
    </Suspense>
  )
}
