import { useEffect, useRef, useState } from 'react'
import { navigate, postSlugFromPath, usePath } from '../lib/router'
import { useSky } from '../lib/useSky'
import { SECTION_IDS, SECTION_LABELS } from '../scene/shots'
import { Footer } from './Chrome'
import Clock from './Clock'
import RadioPlayer, { RadioButton } from './Radio'
import Reader from './Reader'
import Home from './content/Home'
import About from './content/About'
import Experience from './content/Experience'
import Research from './content/Research'
import Projects from './content/Projects'
import Writing from './content/Writing'
import Contact from './content/Contact'
import Still from './Still'

const CONTENT = { about: About, experience: Experience, research: Research, projects: Projects, writing: Writing, contact: Contact }

export default function Mobile() {
  const path = usePath()
  const slug = postSlugFromPath(path)
  const sky = useSky()
  const [active, setActive] = useState('home')
  const tabs = useRef()

  useEffect(() => {
    const id = window.location.hash.replace('#', '')
    if (id && SECTION_IDS.includes(id)) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.body.dataset.activeSection = active
    const chip = tabs.current?.querySelector(`[data-id="${active}"]`)
    chip?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="mobile">
      <header className="m-top">
        <span className="wordmark-name">Ahmed Muharram</span>
        <div className="topbar-right">
          <RadioButton />
          <Clock />
        </div>
      </header>
      <section id="home" className="m-hero">
        <Still phase={sky.state.phase} shot="home" interactive />
        <div className="m-hero-text">
          <Home onNavigate={scrollTo} />
        </div>
      </section>
      <nav className="m-tabs" ref={tabs} aria-label="Sections">
        {SECTION_IDS.slice(1).map((id) => (
          <button key={id} type="button" data-id={id} className={active === id ? 'is-active' : ''} onClick={() => scrollTo(id)}>
            {SECTION_LABELS[id]}
          </button>
        ))}
      </nav>
      {SECTION_IDS.slice(1).map((id) => {
        const Content = CONTENT[id]
        return (
          <section key={id} id={id} className="m-section">
            <Still phase={sky.state.phase} shot={id} />
            <div className="m-card">
              <Content onNavigate={scrollTo} />
            </div>
          </section>
        )
      })}
      <RadioPlayer />
      <Footer section={SECTION_IDS.indexOf(active)} />
      {slug && <Reader slug={slug} onClose={() => navigate('/#writing')} />}
    </div>
  )
}
