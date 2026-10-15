import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { PROJECTS } from '../../data/site'

function Media({ item }) {
  if (item.type === 'image') return <img src={item.src} alt={item.caption} className={item.size === 'small' ? 'is-small' : ''} />
  if (item.type === 'pdf') return <iframe title={item.caption} src={item.src} />
  return <iframe title={item.caption} src={item.src} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
}

export function ProjectDialog({ project, onClose }) {
  const [index, setIndex] = useState(0)
  useEffect(() => setIndex(0), [project])
  const media = project?.media || []
  const item = media[index]
  const step = (d) => setIndex((i) => (i + d + media.length) % media.length)
  return (
    <Dialog.Root open={!!project} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog" aria-describedby={undefined}>
          {project && (
            <>
              <Dialog.Close asChild>
                <button className="dialog-close" type="button" aria-label="Close">
                  ×
                </button>
              </Dialog.Close>
              <div className="dialog-scroll">
                {item && (
                  <div className="media">
                    <div className="media-frame">
                      <Media item={item} />
                      {media.length > 1 && (
                        <>
                          <button type="button" className="media-nav prev" onClick={() => step(-1)} aria-label="Previous media">
                            ←
                          </button>
                          <button type="button" className="media-nav next" onClick={() => step(1)} aria-label="Next media">
                            →
                          </button>
                        </>
                      )}
                    </div>
                    <p className="media-caption">
                      {item.caption}
                      {media.length > 1 && (
                        <span className="mono">
                          {' '}
                          · {index + 1}/{media.length}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <div className="tags">
                  {project.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <Dialog.Title asChild>
                  <h3>{project.title}</h3>
                </Dialog.Title>
                {project.description.split('\n\n').map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
                {project.hint && <p className="hint">{project.hint}</p>}
              </div>
              <div className="dialog-actions">
                {project.link ? (
                  <a className="btn btn-solid" href={project.link} target="_blank" rel="noreferrer">
                    Visit project ↗
                  </a>
                ) : (
                  <span className="muted small">{project.repoStatus === 'private' ? 'Private repo, available on request' : 'Link coming soon'}</span>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default function Projects() {
  const [active, setActive] = useState(null)
  return (
    <div className="content projects-content">
      <p className="eyebrow">Projects</p>
      <h2>
        Things I've <em>made</em>.
      </h2>
      <p className="muted">Systems, search, graphics, games. Open any of them for details, demos, and write-ups.</p>
      <div className="project-grid">
        {PROJECTS.map((p) => (
          <button key={p.title} type="button" className={`project-card${p.featured ? ' is-featured' : ''}`} onClick={() => setActive(p)}>
            <span className="project-cover">{p.cover ? <img src={p.cover} alt="" loading="lazy" /> : <span className="icon" style={{ WebkitMaskImage: `url(${p.icon})`, maskImage: `url(${p.icon})` }} />}</span>
            <span className="project-info">
              <span className="project-name">{p.short}</span>
              <span className="project-tags">{p.tags.slice(0, 3).join(' · ')}</span>
            </span>
          </button>
        ))}
      </div>
      <ProjectDialog project={active} onClose={() => setActive(null)} />
    </div>
  )
}
