import { useState } from 'react'
import { PUBLICATIONS, THESIS } from '../../data/site'

export default function Research() {
  const [fig, setFig] = useState(0)
  const [abstractOpen, setAbstractOpen] = useState(false)
  const figure = THESIS.figures[fig]
  return (
    <div className="content research-content">
      <h2>research</h2>
      <p className="paper-meta muted">my master&apos;s thesis at penn, 2026</p>
      <h3 className="paper-title">{THESIS.title}</h3>
      <p className="paper-byline">advised by chris callison-burch and read by eric wong, with david s. roos (veupathdb), delip rao and andrew zhu. it won the penn engineering outstanding research award.</p>
      <p>{THESIS.summary}</p>
      <div className={`abstract${abstractOpen ? ' is-open' : ''}`}>
        <p>
          <span className="run-in">abstract:</span> {THESIS.abstract[0]}
        </p>
        {abstractOpen && THESIS.abstract.slice(1).map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
        <button type="button" className="text-btn" onClick={() => setAbstractOpen((v) => !v)}>
          {abstractOpen ? 'hide the abstract' : 'read the full abstract'}
        </button>
      </div>
      <figure className="figure">
        <div className="figure-plate">
          {THESIS.figures.map((f, i) => (
            <img key={f.name} src={f.src} alt={`${f.name}: ${f.caption}`} className={i === fig ? 'is-active' : ''} draggable="false" />
          ))}
        </div>
        <figcaption>
          <span className="mono">fig. {fig + 1}</span> <strong>{figure.name}</strong>: {figure.caption}
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
            {figure.name.toLowerCase()} on github ↗
          </a>
        </div>
      </figure>
      <h3 className="subhead">papers</h3>
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
