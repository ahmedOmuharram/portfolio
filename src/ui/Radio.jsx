import { useCallback, useEffect, useRef, useState } from 'react'
import { ui } from '../lib/store'
import { STATIONS, nextStation, setVolume, toggleRadio } from '../lib/radio'

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

function SpeakerIcon({ level }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
      {level > 0 && <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />}
      {level > 50 && <path d="M18 7a7 7 0 0 1 0 10" />}
      {level === 0 && <path d="M16 10l4 4M20 10l-4 4" />}
    </svg>
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

function isYouTube(origin) {
  try {
    return /(^|\.)youtube(-nocookie)?\.com$/.test(new URL(origin).hostname)
  } catch {
    return false
  }
}

export default function RadioPlayer() {
  const playing = ui.use((s) => s.radio)
  const index = ui.use((s) => s.station)
  const volume = ui.use((s) => s.volume)
  const station = STATIONS[index]
  const frame = useRef()
  const volumeRef = useRef(volume)
  const lastHeard = useRef(55)
  const [title, setTitle] = useState(null)
  volumeRef.current = volume

  const send = useCallback((func, args = []) => {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*')
  }, [])

  const applyVolume = useCallback(
    (v) => {
      send('setVolume', [v])
      send(v === 0 ? 'mute' : 'unMute')
    },
    [send],
  )

  useEffect(() => setTitle(null), [station.id])

  useEffect(() => {
    if (!playing) return
    const onMessage = (e) => {
      if (!isYouTube(e.origin)) return
      let data = e.data
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }
      const name = data?.info?.videoData?.title
      if (name) setTitle(name)
      if (data?.event === 'onReady' || data?.event === 'initialDelivery') applyVolume(volumeRef.current)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [playing, applyVolume])

  useEffect(() => {
    if (playing) applyVolume(volume)
  }, [volume, playing, applyVolume])

  const onLoad = () => {
    const hello = () => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*')
    hello()
    ;[400, 1200, 2500, 4500].forEach((ms) =>
      setTimeout(() => {
        hello()
        applyVolume(volumeRef.current)
      }, ms),
    )
  }

  if (!playing) return null
  const origin = encodeURIComponent(window.location.origin)
  const src = `https://www.youtube-nocookie.com/embed/${station.id}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}`

  const toggleMute = () => {
    if (volume > 0) {
      lastHeard.current = volume
      setVolume(0)
    } else {
      setVolume(lastHeard.current || 55)
    }
  }

  return (
    <aside className="radio-card" aria-label="Lofi radio">
      <div className="radio-video">
        <iframe ref={frame} key={station.id} src={src} title={station.name} onLoad={onLoad} allow="autoplay; encrypted-media; picture-in-picture" />
      </div>
      <div className="radio-info">
        <span className="eyebrow">
          Now playing · {index + 1}/{STATIONS.length}
        </span>
        <span className="radio-name" title={title || station.name}>
          {title || station.name}
        </span>
        <div className="radio-volume">
          <button type="button" className="icon-btn" onClick={toggleMute} aria-label={volume === 0 ? 'Unmute' : 'Mute'}>
            <SpeakerIcon level={volume} />
          </button>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Radio volume"
            style={{ '--fill': `${volume}%` }}
          />
        </div>
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
