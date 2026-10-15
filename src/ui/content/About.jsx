import { ABOUT, PROFILE } from '../../data/site'

export default function About() {
  return (
    <div className="content about-content">
      <p className="eyebrow">About</p>
      <h2>
        Systems, agents, and <em>people</em> in the loop.
      </h2>
      {ABOUT.paragraphs.map((p) => (
        <p key={p.slice(0, 24)}>{p}</p>
      ))}
      <dl className="facts">
        {ABOUT.facts.map((f) => (
          <div key={f.k}>
            <dt>{f.k}</dt>
            <dd>{f.v}</dd>
          </div>
        ))}
      </dl>
      <div className="link-row">
        <a href={PROFILE.resume} target="_blank" rel="noopener noreferrer">
          Résumé ↗
        </a>
        {PROFILE.links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  )
}
