import { useState } from 'react'
import { PUBLICATIONS, THESIS } from '../../data/site'

export default function Research() {
  const [fig, setFig] = useState(0)
  const [abstractOpen, setAbstractOpen] = useState(false)
  const figure = THESIS.figures[fig]
  return (
    <div className="content research-content">
      <p className="eyebrow">Research</p>
      <div className="paper-meta">
        <span className="tag">{THESIS.classes}</span>
        <span className="muted mono">{THESIS.venue}</span>
      </div>
      <h2 className="paper-title">{THESIS.title}</h2>
      <p className="paper-byline">
        <strong>Ahmed Muharram</strong> · {THESIS.byline}
      </p>
      <p className="award">
        <span aria-hidden="true">✦</span> {THESIS.award}
      </p>
      <div className="stats">
        {THESIS.stats.map((s) => (
          <div key={s.k} className="stat">
            <span className="stat-v">{s.v}</span>
            <span className="stat-k">{s.k}</span>
          </div>
        ))}
      </div>
      <div className={`abstract${abstractOpen ? ' is-open' : ''}`}>
        <p>
          <span className="run-in">Abstract —</span> {THESIS.abstract[0]}
        </p>
        {abstractOpen && THESIS.abstract.slice(1).map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
        <button type="button" className="text-btn" onClick={() => setAbstractOpen((v) => !v)}>
          {abstractOpen ? 'Show less' : 'Read the full abstract'}
        </button>
      </div>
      <figure className="figure">
        <div className="figure-plate">
          {THESIS.figures.map((f, i) => (
            <img key={f.name} src={f.src} alt={`${f.name}: ${f.caption}`} className={i === fig ? 'is-active' : ''} draggable="false" />
          ))}
        </div>
        <figcaption>
          <span className="mono">Fig. {fig + 1}.</span> <strong>{figure.name}</strong> — {figure.caption}
        </figcaption>
        <p className="muted small">{figure.blurb}</p>
        <div className="figure-foot">
          <div className="pager">
            <button type="button" onClick={() => setFig((f) => (f + THESIS.figures.length - 1) % THESIS.figures.length)} aria-label="Previous figure">
              ←
            </button>
            <span className="mono">
              {fig + 1} / {THESIS.figures.length}
            </span>
            <button type="button" onClick={() => setFig((f) => (f + 1) % THESIS.figures.length)} aria-label="Next figure">
              →
            </button>
          </div>
          <a href={figure.href} target="_blank" rel="noopener noreferrer">
            {figure.name} on GitHub ↗
          </a>
        </div>
      </figure>
      <h3 className="subhead">Publications</h3>
      <ul className="pubs">
        {PUBLICATIONS.map((p) => (
          <li key={p.title}>
            <span className="pub-year mono">{p.year}</span>
            <div>
              <p className="pub-title">{p.title}</p>
              <p className="muted small">
                {p.authors} · {p.venue}
              </p>
              <div className="pub-links">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
