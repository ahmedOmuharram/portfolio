import { lazy, Suspense, useEffect, useState } from 'react'
import Mobile from './ui/Mobile'
import { ui } from './lib/store'
import { PRESETS } from './lib/time'
import { useSky } from './lib/useSky'
import { setFavicon } from './lib/favicon'

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

const timeParam = new URLSearchParams(window.location.search).get('time')
if (PRESETS.some((p) => p.id === timeParam)) ui.set({ timeMode: timeParam })

const AWAY = ['come back, the cats miss you', 'the kettle is still on', 'still here, still lofi']

function useTabDressing() {
  const phase = useSky().state.phase
  useEffect(() => setFavicon(phase), [phase])
  useEffect(() => {
    let saved = null
    let n = 0
    const change = () => {
      if (document.hidden) {
        saved = document.title
        document.title = AWAY[n++ % AWAY.length]
      } else if (saved) {
        document.title = saved
        saved = null
      }
    }
    document.addEventListener('visibilitychange', change)
    return () => document.removeEventListener('visibilitychange', change)
  }, [])
}

export default function App() {
  useTabDressing()
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
