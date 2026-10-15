import { ui } from '../lib/store'
import { STATIONS, nextStation, toggleRadio } from '../lib/radio'

function Bars({ playing }) {
  return (
    <span className={`bars${playing ? ' is-playing' : ''}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}

export function RadioButton() {
  const playing = ui.use((s) => s.radio)
  return (
    <button type="button" className={`chip radio-chip${playing ? ' is-on' : ''}`} onClick={toggleRadio} aria-pressed={playing} aria-label={playing ? 'Stop the radio' : 'Play lofi radio'}>
      <Bars playing={playing} />
      <span className="chip-sub">{playing ? 'on air' : 'lofi radio'}</span>
    </button>
  )
}

export default function RadioPlayer() {
  const playing = ui.use((s) => s.radio)
  const station = STATIONS[ui.use((s) => s.station)]
  if (!playing) return null
  const src = `https://www.youtube-nocookie.com/embed/${station.id}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1`
  return (
    <aside className="radio-card" aria-label="Lofi radio">
      <div className="radio-video">
        <iframe key={station.id} src={src} title={station.name} allow="autoplay; encrypted-media; picture-in-picture" />
      </div>
      <div className="radio-info">
        <span className="eyebrow">Now playing</span>
        <span className="radio-name">{station.name}</span>
        <span className="muted small">{station.note}</span>
        <div className="radio-actions">
          <button type="button" className="text-btn" onClick={nextStation}>
            Next station →
          </button>
          <button type="button" className="text-btn" onClick={toggleRadio}>
            Stop
          </button>
        </div>
      </div>
    </aside>
  )
}
