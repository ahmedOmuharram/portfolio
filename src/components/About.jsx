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
            I am a senior at the University of Pennsylvania, graduating with
            BSE and MSE degrees in Computer and Information Science as an
            Onsi Sawiris Scholarship recipient.
          </p>
          <p>
            I care deeply about clarity, reliability, and the human experience
            of software. I like working where systems and AI meet, bringing
            rigor to complex problems while keeping people at the center.
          </p>
          <p>
            I am currently building privacy‑first AI products and tool‑calling
            LLM agents for scientific workflows. My background spans research
            and industry, and I gravitate toward teams that value depth,
            thoughtful design, and ambitious execution.
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