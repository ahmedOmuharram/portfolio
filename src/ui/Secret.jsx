import { useEffect, useRef, useState } from 'react'
import click from '../assets/click.mp3'
import buzz from '../assets/buzz.mp3'

const KONAMI = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'B', 'A', 'enter']
const ARCADE = 'https://ahmedomuharram.github.io/browser-labyrinth/'

const Arrow = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
)

export default function Secret({ armed }) {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [sequence, setSequence] = useState([])
  const [flash, setFlash] = useState(null)
  const [arcade, setArcade] = useState(false)
  const [stage, setStage] = useState('idle')
  const clickRef = useRef(null)
  const buzzRef = useRef(null)
  const flashTimer = useRef(null)

  useEffect(() => {
    if (!armed) {
      setVisible(false)
      return
    }
    const t = setTimeout(() => setVisible(true), 20000)
    return () => clearTimeout(t)
  }, [armed])

  useEffect(() => {
    const reset = () => setSequence([])
    const vis = () => document.hidden && reset()
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', vis)
    return () => {
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', vis)
      clearTimeout(flashTimer.current)
    }
  }, [])

  const ready = sequence.length === KONAMI.length - 1 && sequence.every((k, i) => k === KONAMI[i])

  const press = (key) => {
    setFlash(key)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 220)
    if (clickRef.current) {
      clickRef.current.currentTime = 0
      clickRef.current.play().catch(() => {})
    }
    setSequence((prev) => (key === KONAMI[prev.length] ? [...prev, key] : key === KONAMI[0] ? [key] : []))
  }

  const enter = () => {
    const next = [...sequence, 'enter'].slice(-KONAMI.length)
    if (next.join('|') === KONAMI.join('|')) {
      setOpen(false)
      setArcade(true)
      requestAnimationFrame(() => setStage('fade-to-black'))
      setTimeout(() => setStage('show-arcade'), 4000)
    } else if (buzzRef.current) {
      buzzRef.current.currentTime = 0
      buzzRef.current.play().catch(() => {})
    }
    setSequence([])
  }

  const closeArcade = () => {
    setStage('fade-arcade')
    setTimeout(() => {
      setStage('fade-back')
      setTimeout(() => {
        setArcade(false)
        setStage('idle')
      }, 4000)
    }, 1200)
  }

  const key = (k, label) => (
    <button type="button" className={`keypad-key${flash === k ? ' is-correct' : ''}`} onClick={() => press(k)} aria-label={k}>
      {label}
    </button>
  )

  return (
    <>
      <audio ref={clickRef} src={click} preload="auto" />
      <audio ref={buzzRef} src={buzz} preload="auto" />
      <button type="button" className={`secret-button${visible ? ' is-visible' : ''}`} onClick={() => setOpen(true)} disabled={!visible}>
        looking for something?
      </button>
      {open && (
        <div className="secret-modal" onClick={() => setOpen(false)}>
          <div className="secret-card" onClick={(e) => e.stopPropagation()}>
            <div className="secret-title">secret code</div>
            <div className="secret-keypad">
              <div className="keypad-dpad">
                {key('up', <Arrow d="M6 14l6-6 6 6" />)}
                {key('left', <Arrow d="M14 6l-6 6 6 6" />)}
                {key('down', <Arrow d="M6 10l6 6 6-6" />)}
                {key('right', <Arrow d="M10 6l6 6-6 6" />)}
              </div>
              <div className="keypad-buttons">
                {key('B', 'B')}
                {key('A', 'A')}
              </div>
            </div>
            <button type="button" className={`keypad-enter${ready ? ' is-ready' : ''}`} onClick={enter}>
              <span>enter</span>
            </button>
          </div>
        </div>
      )}
      {arcade && (
        <div className={`arcade ${stage}`} onClick={closeArcade}>
          <div className="arcade-stars" aria-hidden="true" />
          <div className="arcade-frame" onClick={(e) => e.stopPropagation()}>
            <button className="arcade-close" type="button" onClick={closeArcade} aria-label="Close">
              ×
            </button>
            <div className="arcade-screen">
              <div className="arcade-viewport">
                <iframe title="Browser's Labyrinth" src={ARCADE} allow="fullscreen" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
