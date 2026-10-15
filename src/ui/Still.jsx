import { useEffect, useState } from 'react'
import { purr, strum } from '../lib/audio'
import { toggleRadio } from '../lib/radio'

const PHASES = ['night', 'dawn', 'day', 'golden', 'dusk']
const ACTIONS = { cat: purr, catSill: purr, radio: toggleRadio, guitar: strum }

let spotsPromise = null
function loadSpots() {
  if (!spotsPromise) spotsPromise = fetch('/room/spots.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}))
  return spotsPromise
}

export default function Still({ phase, shot, interactive = false }) {
  const [spots, setSpots] = useState([])
  const [pulse, setPulse] = useState(null)
  useEffect(() => {
    if (!interactive) return
    loadSpots().then((s) => setSpots(s[shot] || []))
  }, [interactive, shot])
  const tap = (s) => {
    ACTIONS[s.id]?.()
    setPulse(s.id + Date.now())
  }
  return (
    <div className={`still still-${shot}`}>
      {PHASES.map((p) => (
        <img
          key={p}
          src={`/room/${shot}-${p}.webp`}
          alt=""
          aria-hidden="true"
          loading={shot === 'home' ? 'eager' : 'lazy'}
          decoding="async"
          className={p === phase ? 'is-active' : ''}
        />
      ))}
      <div className="still-grain" aria-hidden="true" />
      {spots.map((s) => (
        <button
          key={s.id}
          type="button"
          className="still-spot"
          style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
          onClick={() => tap(s)}
          aria-label={s.label}
        >
          <span className={pulse && pulse.startsWith(s.id) ? 'is-pulsing' : ''} key={pulse} />
        </button>
      ))}
    </div>
  )
}
