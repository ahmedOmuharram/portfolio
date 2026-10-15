import { lazy, Suspense, useCallback, useEffect, useRef } from 'react'
import { ui } from '../lib/store'
import { navigate, postSlugFromPath, usePath } from '../lib/router'
import { SECTION_IDS } from '../scene/shots'
import { Footer, HoverLabel, Loader, Rail, TopBar } from './Chrome'
import RadioPlayer from './Radio'
import Reader from './Reader'
import Home from './content/Home'
import About from './content/About'
import Experience from './content/Experience'
import Research from './content/Research'
import Projects from './content/Projects'
import Writing from './content/Writing'
import Contact from './content/Contact'

const Scene = lazy(() => import('../scene/Scene'))

const PANELS = {
  home: { side: 'hero', Content: Home },
  about: { side: 'right', Content: About },
  experience: { side: 'left', Content: Experience },
  research: { side: 'right', Content: Research },
  projects: { side: 'left', Content: Projects },
  writing: { side: 'left', Content: Writing },
  contact: { side: 'left', Content: Contact },
}

function sectionFromHash() {
  const id = window.location.hash.replace('#', '')
  const i = SECTION_IDS.indexOf(id)
  return i >= 0 ? i : 0
}

function canScroll(el, dir) {
  if (!el) return false
  if (dir > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 2
  return el.scrollTop > 2
}

export default function Desktop({ quality }) {
  const section = ui.use((s) => s.section)
  const path = usePath()
  const slug = postSlugFromPath(path)
  const cooldown = useRef(0)
  const panelRefs = useRef({})

  const go = useCallback((i) => {
    const next = Math.max(0, Math.min(SECTION_IDS.length - 1, i))
    ui.set({ section: next })
  }, [])

  useEffect(() => {
    ui.set({ section: sectionFromHash() })
    const onHash = () => ui.set({ section: sectionFromHash() })
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const id = SECTION_IDS[section]
    document.body.dataset.activeSection = id
    if (postSlugFromPath(window.location.pathname)) return
    const hash = id === 'home' ? '' : `#${id}`
    if (window.location.hash !== hash) window.history.replaceState(null, '', `/${hash}`)
  }, [section])

  useEffect(() => {
    const blocked = () => !!document.querySelector('.dialog, .reader, .secret-modal, .arcade')
    const step = (dir) => {
      const now = performance.now()
      if (now < cooldown.current) return
      cooldown.current = now + 950
      go(ui.get().section + dir)
    }
    const onWheel = (e) => {
      if (blocked()) return
      const dir = Math.sign(e.deltaY)
      if (!dir || Math.abs(e.deltaY) < 8) return
      const scroller = e.target.closest?.('.panel-scroll')
      if (scroller && canScroll(scroller, dir)) {
        cooldown.current = performance.now() + 450
        return
      }
      e.preventDefault()
      step(dir)
    }
    const onKey = (e) => {
      if (blocked()) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        go(ui.get().section + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        go(ui.get().section - 1)
      } else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(SECTION_IDS.length - 1)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [go])

  useEffect(() => {
    const el = panelRefs.current[SECTION_IDS[section]]
    if (el) el.scrollTop = 0
  }, [section])

  const closeReader = useCallback(() => {
    navigate('/#writing')
    ui.set({ section: SECTION_IDS.indexOf('writing') })
  }, [])

  return (
    <div className={`desktop section-${SECTION_IDS[section]}`}>
      <div className="stage">
        <Suspense fallback={null}>
          <Scene quality={quality} onReady={() => setTimeout(() => ui.set({ ready: true }), 350)} />
        </Suspense>
      </div>
      <div className="shade" aria-hidden="true" />
      <TopBar onHome={() => go(0)} />
      <main className="panels">
        {SECTION_IDS.map((id, i) => {
          const { side, Content } = PANELS[id]
          const state = i === section ? 'is-active' : i < section ? 'is-before' : 'is-after'
          return (
            <section key={id} id={id} className={`panel panel-${side} ${state}`} aria-hidden={i !== section} inert={i !== section}>
              <div className="panel-scroll" ref={(el) => (panelRefs.current[id] = el)}>
                <Content onNavigate={(target) => go(SECTION_IDS.indexOf(target))} />
              </div>
            </section>
          )
        })}
      </main>
      <Rail section={section} onGo={go} />
      {section === 0 && (
        <button type="button" className="scroll-hint" onClick={() => go(1)}>
          <span className="mono">scroll</span>
          <i />
        </button>
      )}
      <HoverLabel />
      <RadioPlayer />
      <Footer section={section} />
      {slug && <Reader slug={slug} onClose={closeReader} />}
      <Loader />
    </div>
  )
}
