import React from 'react'
import WireframeBrain from './WireframeBrain'
import './About.css'

const About = () => {
  return (
    <div className="about-container">
      <div className="about-layout">
        <div className="about-text">
          <h2>About</h2>
          <p>
            I'm a recent graduate of the University of Pennsylvania (BSE and
            MSE in Computer and Information Science, May 2026) and an Onsi
            Sawiris Scholar.
          </p>
          <p>
            I care deeply about clarity, reliability, and the human experience
            of software. I like working where systems and AI meet, bringing
            rigor to complex problems while keeping people at the center.
          </p>
          <p>
            I build privacy‑first AI products and tool‑calling LLM agents for
            scientific workflows. My background spans research and industry,
            and I gravitate toward teams that value depth, thoughtful design,
            and ambitious execution.
          </p>
        </div>
        <div className="brain-panel">
          <WireframeBrain />
          <div className="brain-caption">Curiosity in motion</div>
        </div>
      </div>
    </div>
  )
}

export default About 