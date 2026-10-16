import { useEffect, useRef, useState } from 'react'
import { petCat, strum } from '../lib/audio'
import { toggleRadio } from '../lib/radio'

const PHASES = ['night', 'dawn', 'day', 'golden', 'dusk']
const VARIANTS = ['night', 'golden']
const ACTIONS = { cat: () => petCat('cat'), catSill: () => petCat('sill'), catFloor: () => petCat('floor'), radio: toggleRadio, guitar: strum }

let spotsPromise = null
function loadSpots() {
  if (!spotsPromise)
    spotsPromise = fetch('/room/spots.json')
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
  return spotsPromise
}

export default function Still({ phase, shot, interactive = false }) {
  const [spots, setSpots] = useState([])
  const [pulse, setPulse] = useState(null)
  const [box, setBox] = useState(null)
  const ref = useRef()
  useEffect(() => {
    if (!interactive || !ref.current) return
    const el = ref.current
    const ratio = 450 / 975
    const measure = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const scale = Math.max(w / ratio, h)
      const iw = scale * ratio
      const ih = scale
      setBox({ left: (w - iw) / 2, top: (h - ih) / 2, width: iw, height: ih })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [interactive])
  useEffect(() => {
    if (!interactive) return
    loadSpots().then((s) => setSpots(s[shot] || []))
  }, [interactive, shot])
  const tap = (s) => {
    const kind = ACTIONS[s.id]?.()
    setPulse({ id: s.id, kind: kind || 'purr', n: Date.now() })
  }
  const home = shot === 'home'
  const options = home ? PHASES : VARIANTS
  const current = home ? phase : phase === 'night' || phase === 'dusk' ? 'night' : 'golden'
  return (
    <div className={`still still-${shot}`} ref={ref}>
      <div className="still-inner">
        {options.map((p) => (
          <img key={p} src={`/room/${shot}-${p}.webp`} alt="" aria-hidden="true" loading={home && p === current ? 'eager' : 'lazy'} decoding="async" className={p === current ? 'is-active' : ''} />
        ))}
        {box &&
          spots.map((s) => (
            <button key={s.id} type="button" className="still-spot" style={{ left: box.left + s.x * box.width, top: box.top + s.y * box.height }} onClick={() => tap(s)} aria-label={s.label}>
              <span className={pulse && pulse.id === s.id ? `is-pulsing is-${pulse.kind}` : ''} key={pulse ? pulse.n : 0} />
            </button>
          ))}
      </div>
      <div className="still-grain" aria-hidden="true" />
    </div>
  )
}
