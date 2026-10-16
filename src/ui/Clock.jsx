import { useEffect, useRef, useState } from 'react'
import { ui } from '../lib/store'
import { useSky } from '../lib/useSky'
import { CITY, PRESETS, formatClock } from '../lib/time'

const PHASE_LABEL = { night: 'night', dawn: 'dawn', day: 'daytime', golden: 'golden hour', dusk: 'dusk' }

function PhaseIcon({ phase }) {
  if (phase === 'night' || phase === 'dusk')
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return <line key={i} x1={12 + Math.cos(a) * 7} y1={12 + Math.sin(a) * 7} x2={12 + Math.cos(a) * 9.4} y2={12 + Math.sin(a) * 9.4} />
      })}
    </svg>
  )
}

export default function Clock() {
  const sky = useSky()
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])
  const live = sky.mode === 'live'
  return (
    <div className="clock" ref={ref}>
      <button type="button" className="chip" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Time of day">
        <PhaseIcon phase={sky.state.phase} />
        <span className="mono">{formatClock(live ? sky.now.decimal : sky.hour)}</span>
        <span className="chip-sub">
          {CITY.toLowerCase()} · {PHASE_LABEL[sky.state.phase]}
        </span>
      </button>
      {open && (
        <div className="menu" role="menu">
          <p className="menu-note">the room follows {CITY.toLowerCase()} time. want to see it at a different time of day?</p>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="menuitemradio"
              aria-checked={sky.mode === p.id}
              className={sky.mode === p.id ? 'is-active' : ''}
              onClick={() => {
                ui.set({ timeMode: p.id })
                setOpen(false)
              }}
            >
              {p.id === 'live' ? `right now · ${formatClock(sky.now.decimal)}` : p.label.toLowerCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
