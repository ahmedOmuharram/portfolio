import React, { useState } from 'react'
import './Experience.css'
import fidInvst from '../assets/fid-invst.png'
import aydi from '../assets/aydi.png'
import orascom from '../assets/orascom.png'
import publicResume from '../assets/public_resume.pdf'

const experienceData = [
  {
    title: 'R&D Software Developer',
    company: 'Orascom Construction',
    dates: 'Jul 2026 — Present',
    logo: orascom,
    current: true,
    note: 'Current position; more to come.',
  },
  {
    title: 'AI / ML Engineer',
    company: 'Fidelity Investments',
    dates: 'Dec 2025 — Jan 2026',
    logo: fidInvst,
    bullets: [
      'Rejoined to take the previously developed system (an R&D LLM/RAG prototype) into production, expanding it to arbitrary enterprise data sources via a standardized connector, ingestion, and indexing template that let teams onboard new corpora without one-off work.',
      'Replaced the BM25S retrieval index with a custom hybrid PostgreSQL full-text search + pgvector design, cutting refresh latency from 10 minutes per 1M chunks to under 1 second while holding retrieval quality steady under continuous corpus updates.',
      'Implemented multivector / late-interaction retrieval with hybrid-score reranking, sharded the Qdrant cluster for scale, and backfilled historical embeddings into pgvector to unify legacy and new corpora.',
      'Presented the system to the R&D org and supported rollout; it is now used in production by ~200 daily users.',
    ],
  },
  {
    title: 'Data Science & AI Intern',
    company: 'Fidelity Investments',
    dates: 'Jun 2025 — Aug 2025',
    logo: fidInvst,
    bullets: [
      'Designed a high-throughput ingestion pipeline for terabytes of internal data, reaching 99.99%+ success through validation, retries, and idempotent writes that kept downstream analytics and search reliable.',
      'Delivered a grounded RAG workflow using Qdrant and pgvector, and added hallucination checks plus evaluation metrics to track answer quality and failure modes over time.',
      'Containerized and deployed the pipeline and services with Docker and Kubernetes, ensuring reproducible environments and smooth handoff to internal users.',
    ],
  },
  {
    title: 'Software Engineering Intern · AI Integration',
    company: 'Aydi',
    dates: 'Jun 2024 — Aug 2024',
    logo: aydi,
    bullets: [
      'Built a chatbot for agricultural business owners in low-connectivity environments, using Haystack, MongoDB Atlas, Redis, and GPT-4o-family models to deliver real-time analytics with 85%+ top-1 retrieval accuracy.',
      'Added four Jest test suites for JavaScript services and introduced token/latency monitoring with tiktoken to guide performance tuning and cost control.',
      'Reduced LLM spend by 96.25% by recommending a shift from GPT-4o to GPT-4o mini after a cost/quality analysis based on usage patterns.',
    ],
  },
]

// "previously developed system" (in the AI/ML Engineer role) jumps to the
// internship where that system was first built.
const LINKED_TARGET = 2

const Experience = () => {
  const [activeIndex, setActiveIndex] = useState(1)

  const toggle = (i) => setActiveIndex((cur) => (cur === i ? -1 : i))

  const renderBullet = (bullet, jobIndex, key) => {
    if (jobIndex === 1 && key === 0 && bullet.includes('previously developed system')) {
      const [before, after] = bullet.split('previously developed system')
      return (
        <li key={key}>
          {before}
          <button
            className="xp-inline-link"
            type="button"
            onClick={() => setActiveIndex(LINKED_TARGET)}
          >
            previously developed system
          </button>
          {after}
        </li>
      )
    }
    return <li key={key}>{bullet}</li>
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
        <p>Selected roles across ML systems, retrieval, and enterprise software.</p>
      </div>

      <ol className="xp-timeline">
        {experienceData.map((job, i) => {
          const open = i === activeIndex
          return (
            <li
              key={`${job.title}-${job.company}`}
              className={`xp-item${open ? ' is-open' : ''}${job.current ? ' is-current' : ''}`}
            >
              <span className="xp-node" aria-hidden="true" />
              <button
                className="xp-head"
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={open}
              >
                <span className="xp-dates">
                  {job.dates}
                  {job.current && <span className="xp-badge">Current</span>}
                </span>
                <span className="xp-role">
                  <span className="xp-logo">
                    {job.logo ? (
                      <img src={job.logo} alt="" />
                    ) : (
                      <span className="xp-logo-initial">{job.company[0]}</span>
                    )}
                  </span>
                  <span className="xp-titles">
                    <span className="xp-title">{job.title}</span>
                    <span className="xp-company">{job.company}</span>
                  </span>
                  <span className="xp-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </button>
              <div className="xp-detail">
                <div className="xp-detail-inner">
                  {job.bullets ? (
                    <ul className="xp-bullets">
                      {job.bullets.map((b, k) => renderBullet(b, i, k))}
                    </ul>
                  ) : (
                    <p className="xp-note">{job.note}</p>
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

export default Experience
