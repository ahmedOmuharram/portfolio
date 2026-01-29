import React, { useLayoutEffect, useRef, useState } from 'react'
import './Experience.css'
import fidInvst from '../assets/fid-invst.png'
import aydi from '../assets/aydi.png'
import publicResume from '../assets/public_resume.pdf'

const experienceData = [
  {
    title: 'AI/ML Engineer (Temporary Hire)',
    company: 'Fidelity Investments',
    dates: 'Dec 2025 - Jan 2026',
    logo: fidInvst,
    bullets: [
      'Rejoined to take the previously developed system (an R&D LLM/RAG prototype) into production. I expanded the system to support generic data sources by formalizing a connector → ingestion → indexing template that teams could follow without one-off work.',
      'Redesigned retrieval to handle fast refreshes by replacing the BM25S index with a PostgreSQL full-text search (inverted index) + pgvector hybrid. This cut 1M-chunk refresh latency from 10 minutes to under 1 second while keeping relevance stable as corpora evolved.',
      'Built advanced retrieval using multivector / late-interaction scoring and improved scalability with Qdrant sharding and load balancing. This increased corpus capacity and broadened document coverage across sources.',
      'Backfilled legacy embeddings into pgvector to unify historical and new data. I presented the system to the R&D org, supported rollout, and it is now used in production by ~200 daily users.',
    ],
  },
  {
    title: 'Data Science and Artificial Intelligence Intern',
    company: 'Fidelity Investments',
    dates: 'Jun 2025 - Aug 2025',
    logo: fidInvst,
    bullets: [
      'Designed a high-throughput ingestion pipeline for terabytes of internal data, reaching 99.99%+ success through validation, retries, and idempotent writes that kept downstream analytics and search reliable.',
      'Delivered a grounded RAG workflow using Qdrant and pgvector, and added hallucination checks plus evaluation metrics to track answer quality and failure modes over time.',
      'Containerized and deployed the pipeline and services with Docker and Kubernetes, ensuring reproducible environments and smooth handoff to internal users.',
    ],
  },
  {
    title: 'Software Engineering Intern (AI Integration)',
    company: 'Aydi',
    dates: 'Jun 2024 - Aug 2024',
    logo: aydi,
    bullets: [
      'Built a chatbot for agricultural business owners in low-connectivity environments, using Haystack, MongoDB Atlas, Redis, and GPT-4o-family models to deliver real-time analytics with 85%+ top-1 retrieval accuracy.',
      'Added four Jest test suites for JavaScript services and introduced token/latency monitoring with tiktoken to guide performance tuning and cost control.',
      'Reduced LLM spend by 96.25% by recommending a shift from GPT-4o to GPT-4o mini after a cost/quality analysis based on usage patterns.',
    ],
  },
]

const Experience = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const linkedSystemTargetIndex = 1
  const panelRefs = useRef([])
  const [detailMinHeight, setDetailMinHeight] = useState(0)

  useLayoutEffect(() => {
    const heights = panelRefs.current.map((panel) => panel?.scrollHeight || 0)
    const maxHeight = Math.max(0, ...heights)
    const adjustedHeight = Math.max(0, maxHeight - 24)
    if (adjustedHeight && adjustedHeight !== detailMinHeight) {
      setDetailMinHeight(adjustedHeight)
    }
  }, [detailMinHeight])

  const renderBullet = (bullet, jobIndex, bulletIndex) => {
    if (jobIndex === 0 && bulletIndex === 0 && bullet.includes('previously developed system')) {
      const [before, after] = bullet.split('previously developed system')
      return (
        <li key={`${jobIndex}-${bulletIndex}`}>
          {before}
          <button
            className="experience-inline-link"
            type="button"
            onClick={() => setActiveIndex(linkedSystemTargetIndex)}
          >
            previously developed system
          </button>
          {after}
        </li>
      )
    }

    return <li key={`${jobIndex}-${bulletIndex}`}>{bullet}</li>
  }

  return (
    <div className="experience-container">
      <div className="experience-header">
        <div className="experience-header-row">
          <h2>Experience</h2>
          <a
            className="experience-resume"
            href={publicResume}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Resume
          </a>
        </div>
        <p>Selected roles focused on ML systems, retrieval, and production delivery.</p>
      </div>
      <div className="experience-body">
        <div className="experience-rail-list" role="tablist" aria-label="Experience timeline">
          {experienceData.map((job, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={`${job.title}-${job.company}`}
                className={`experience-tab${isActive ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`experience-panel-${index}`}
                onClick={() => setActiveIndex(index)}
              >
                <span className="experience-tab-icon" aria-hidden="true">
                  {job.logo && (
                    <img className="experience-tab-logo" src={job.logo} alt="" />
                  )}
                </span>
                <span className="experience-tab-content">
                  <span className="experience-tab-title">{job.title}</span>
                  <span className="experience-tab-company">{job.company}</span>
                  <span className="experience-tab-dates">{job.dates}</span>
                </span>
                <span className="experience-tab-accent" aria-hidden="true" />
              </button>
            )
          })}
        </div>
        <div
          className="experience-detail"
          style={detailMinHeight ? { minHeight: `${detailMinHeight}px` } : undefined}
        >
          {experienceData.map((job, index) => {
            const isActive = index === activeIndex
            return (
              <article
                key={`${job.title}-${job.company}-panel`}
                id={`experience-panel-${index}`}
                className={`experience-panel${isActive ? ' is-active' : ''}`}
                role="tabpanel"
                aria-hidden={!isActive}
                ref={(element) => {
                  panelRefs.current[index] = element
                }}
              >
                <div className="experience-detail-header">
                  <div className="experience-heading">
                    {job.logo && (
                      <img className="experience-logo" src={job.logo} alt={`${job.company} logo`} />
                    )}
                    <div>
                      <div className="experience-title">{job.title}</div>
                      <div className="experience-company">{job.company}</div>
                    </div>
                  </div>
                  <div className="experience-dates">{job.dates}</div>
                </div>
                <ul className="experience-bullets">
                  {job.bullets.map((bullet, bulletIndex) =>
                    renderBullet(bullet, index, bulletIndex),
                  )}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Experience
