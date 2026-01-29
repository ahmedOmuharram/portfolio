import React, { useEffect, useRef, useState } from 'react'
import './Footer.css'
import click from '../assets/click.mp3'
import buzz from '../assets/buzz.mp3'

const Footer = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [sequence, setSequence] = useState([])
  const [showArcade, setShowArcade] = useState(false)
  const [arcadeStage, setArcadeStage] = useState('idle') // idle | fade-to-black | show-arcade | fade-arcade | fade-back
  const [showSecretButton, setShowSecretButton] = useState(false)
  const [flashKey, setFlashKey] = useState(null)
  const clickRef = useRef(null)
  const buzzRef = useRef(null)
  const flashTimeoutRef = useRef(null)

  const konami = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'B', 'A', 'enter']
  const isCodeReady =
    sequence.length === konami.length - 1 &&
    sequence.every((key, index) => key === konami[index])

  const arcadeUrl = 'https://ahmedomuharram.github.io/browser-labyrinth/'

  const triggerKeyFeedback = (key) => {
    setFlashKey(key)
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current)
    }
    flashTimeoutRef.current = setTimeout(() => {
      setFlashKey(null)
      flashTimeoutRef.current = null
    }, 220)
    if (clickRef.current) {
      clickRef.current.currentTime = 0
      clickRef.current.play().catch(() => {})
    }
  }

  const pushKey = (key) => {
    triggerKeyFeedback(key)
    setSequence((prev) => {
      const expected = konami[prev.length]
      if (key === expected) {
        return [...prev, key]
      }
      return prev.length > 0 ? [] : key === konami[0] ? [key] : []
    })
  }

  const handleEnter = () => {
    const next = [...sequence, 'enter'].slice(-konami.length)
    if (next.join('|') === konami.join('|')) {
      setShowArcade(true)
      requestAnimationFrame(() => {
        setArcadeStage('fade-to-black')
      })
      setTimeout(() => setArcadeStage('show-arcade'), 4000)
    } else if (buzzRef.current) {
      buzzRef.current.currentTime = 0
      buzzRef.current.play().catch(() => {})
    }
    setSequence([])
  }

  const handleArcadeClose = () => {
    setArcadeStage('fade-arcade')
    setTimeout(() => {
      setArcadeStage('fade-back')
      setTimeout(() => {
        setShowArcade(false)
        setArcadeStage('idle')
      }, 4000)
    }, 1200)
  }

  useEffect(() => {
    let timer = null
    if (document.body.dataset.activeSection === 'contact') {
      timer = setTimeout(() => setShowSecretButton(true), 20000)
    } else {
      setShowSecretButton(false)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [document.body.dataset.activeSection])

  useEffect(() => () => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current)
      flashTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    const resetSequence = () => setSequence([])
    const handleVisibility = () => {
      if (document.hidden) resetSequence()
    }
    window.addEventListener('blur', resetSequence)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('beforeunload', resetSequence)
    return () => {
      window.removeEventListener('blur', resetSequence)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', resetSequence)
    }
  }, [])

  return (
    <div className="footer-container">
      <audio ref={clickRef} src={click} preload="auto" />
      <audio ref={buzzRef} src={buzz} preload="auto" />
      <div className="footer-blur-background"></div>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Ahmed Muharram. All rights reserved</p>
        <button
          type="button"
          className={`footer-secret-button ${showSecretButton ? 'is-visible' : ''}`}
          onClick={() => setIsOpen(true)}
          disabled={!showSecretButton}
        >
          Looking for something?
        </button>
        <ul>
          <li>
            <a href="https://github.com/ahmedomuharram" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </li>
          <li>
            <a href="https://linkedin.com/in/ahmed-muharram" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </li>
        </ul>
      </footer>

      {isOpen && (
        <div className="footer-secret-modal" onClick={() => setIsOpen(false)}>
          <div className="footer-secret-card" onClick={(e) => e.stopPropagation()}>
            <div className="footer-secret-title">Secret Code</div>
            <div className="footer-secret-keypad">
              <div className="keypad-dpad">
                <button
                  type="button"
                  className={`keypad-key ${flashKey === 'up' ? 'is-correct' : ''}`}
                  onClick={() => pushKey('up')}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 14l6-6 6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`keypad-key ${flashKey === 'left' ? 'is-correct' : ''}`}
                  onClick={() => pushKey('left')}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14 6l-6 6 6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`keypad-key ${flashKey === 'down' ? 'is-correct' : ''}`}
                  onClick={() => pushKey('down')}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 10l6 6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`keypad-key ${flashKey === 'right' ? 'is-correct' : ''}`}
                  onClick={() => pushKey('right')}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
              <div className="keypad-buttons">
                <button
                  type="button"
                  className={`keypad-key ${flashKey === 'B' ? 'is-correct' : ''}`}
                  onClick={() => pushKey('B')}
                >
                  B
                </button>
                <button
                  type="button"
                  className={`keypad-key ${flashKey === 'A' ? 'is-correct' : ''}`}
                  onClick={() => pushKey('A')}
                >
                  A
                </button>
              </div>
            </div>
            <button
              type="button"
              className={`keypad-enter ${isCodeReady ? 'is-ready' : ''}`}
              onClick={handleEnter}
            >
              <span className="keypad-enter-label">Enter</span>
            </button>
          </div>
        </div>
      )}

      {showArcade && (
        <div className={`footer-arcade-modal ${arcadeStage}`} onClick={handleArcadeClose}>
          <div className="footer-arcade-stars" aria-hidden="true"></div>
          <div className="footer-arcade-frame" onClick={(e) => e.stopPropagation()}>
            <button className="footer-arcade-close" type="button" onClick={handleArcadeClose}>
              ×
            </button>
            <div className="footer-arcade-screen">
              <div className="footer-arcade-viewport">
                <iframe
                  title="Browser's Labyrinth"
                  src={arcadeUrl}
                  allow="fullscreen"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Footer 