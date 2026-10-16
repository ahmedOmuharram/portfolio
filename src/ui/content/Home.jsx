import { PROFILE } from '../../data/site'
import { ui } from '../../lib/store'
import { SECTION_IDS } from '../../scene/shots'

const go = (id) => ui.set({ section: SECTION_IDS.indexOf(id) })

export default function Home({ onNavigate = go }) {
  return (
    <div className="hero">
      <h1 className="hero-name">
        ahmed <span>muharram</span>
      </h1>
      <p className="hero-lede">
        hi, i&apos;m ahmed. i build llm agents and search systems. right now i&apos;m doing r&amp;d at orascom construction in cairo. before that i did my bachelor&apos;s
        and master&apos;s at penn.
      </p>
      <div className="hero-actions">
        <button type="button" className="btn btn-solid" onClick={() => onNavigate('projects')}>
          see projects
        </button>
        <button type="button" className="btn" onClick={() => onNavigate('research')}>
          read my thesis
        </button>
        <a className="btn btn-ghost" href={PROFILE.resume} target="_blank" rel="noopener noreferrer">
          résumé ↗
        </a>
      </div>
    </div>
  )
}
