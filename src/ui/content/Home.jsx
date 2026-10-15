import { PROFILE } from '../../data/site'
import { ui } from '../../lib/store'
import { SECTION_IDS } from '../../scene/shots'

const go = (id) => ui.set({ section: SECTION_IDS.indexOf(id) })

export default function Home({ onNavigate = go }) {
  return (
    <div className="hero">
      <p className="eyebrow">
        {PROFILE.role} <span>·</span> {PROFILE.location}
      </p>
      <h1 className="hero-name">
        Ahmed <em>Muharram</em>
      </h1>
      <p className="hero-lede">
        I build tool-calling LLM agents, retrieval systems, and the quiet infrastructure underneath them. Currently doing R&amp;D at Orascom Construction, after a
        Bachelor's and Master's at Penn.
      </p>
      <div className="hero-actions">
        <button type="button" className="btn btn-solid" onClick={() => onNavigate('projects')}>
          See the work
        </button>
        <button type="button" className="btn" onClick={() => onNavigate('research')}>
          Read the research
        </button>
        <a className="btn btn-ghost" href={PROFILE.resume} target="_blank" rel="noopener noreferrer">
          Résumé ↗
        </a>
      </div>
    </div>
  )
}
