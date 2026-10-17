import { useState } from 'react'
import { EXPERIENCE, PROFILE } from '../../data/site'

function Bullet({ text, link, onJump }) {
  if (!link || !text.includes(link.phrase)) return <li>{text}</li>
  const [before, after] = text.split(link.phrase)
  return (
    <li>
      {before}
      <button type="button" className="inline-link" onClick={() => onJump(link.target)}>
        {link.phrase}
      </button>
      {after}
    </li>
  )
}

export default function Experience() {
  const [open, setOpen] = useState(1)
  return (
    <div className="content experience-content">
      <div className="content-head">
        <h2>work</h2>
        <a className="btn btn-small" href={PROFILE.resume} target="_blank" rel="noopener noreferrer">
          résumé ↗
        </a>
      </div>
      <ol className="timeline">
        {EXPERIENCE.map((job, i) => {
          const isOpen = open === i
          return (
            <li key={job.title + job.dates} className={`job${isOpen ? ' is-open' : ''}${job.current ? ' is-current' : ''}`}>
              <button type="button" className="job-head" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                <span className="job-logo">
                  <img src={job.logo} alt="" />
                </span>
                <span className="job-titles">
                  <span className="job-title">
                    {job.title}
                    {job.aka && <span className="job-aka"> ({job.aka})</span>}
                  </span>
                  <span className="job-company">{job.company}</span>
                </span>
                <span className="job-dates">
                  {job.current && <span className="badge">now</span>}
                  {job.dates}
                </span>
              </button>
              <div className="job-body">
                <div className="job-body-inner">
                  {job.bullets ? (
                    <ul>
                      {job.bullets.map((b) => (
                        <Bullet key={b.slice(0, 30)} text={b} link={job.link} onJump={setOpen} />
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">{job.note}</p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
