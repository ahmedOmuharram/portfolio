import React, { useEffect, useMemo, useRef, useState } from 'react'
import './Projects.css'
import browsersLabyrinthGif from '../assets/browserslabyrinth.gif'
import prodosphereGif from '../assets/prodosphere.gif'
import bytenetGif from '../assets/bytenet.gif'
import bytenetReport from '../assets/bytenet-report.pdf'
import btc1 from '../assets/btc1.jpeg'
import btc2 from '../assets/btc2.jpeg'
import sceniq1 from '../assets/sceniq1.png'
import sceniq2 from '../assets/sceniq2.png'
import sceniq3 from '../assets/sceniq3.png'
import instalite1 from '../assets/instalite1.png'
import instalite2 from '../assets/instalite2.png'
import instaliteReport from '../assets/instalite.pdf'

const projectsData = [
  {
    title: 'ScenIQ: On-Prem Meeting Intelligence',
    shortLabel: 'ScenIQ',
    description:
      'An on-prem, security-first meeting intelligence system that transforms video into transcripts, topics, and action items. Modular Python + FastAPI backend with Postgres/pgvector, Zoom/Teams ingestion, ClickUp/Jira outputs, and a React/TypeScript frontend for enterprise workflows. Optimized pipeline performance that processes a 5-minute video in roughly 1-2 minutes.',
    hint: "Hint 3: Knowledge Occults Names; Ashes Map Intentions. this is the Clever Owl's oDE.",
    link: 'https://sceniq.app',
    shape: 'circle',
    position: { x: 86, y: 24 },
    icon: '/project_svgs/sceniq.svg',
    media: [
      { type: 'image', src: sceniq1, caption: 'Action item graph overview and UI.' },
      { type: 'image', src: sceniq2, caption: 'Meeting page view.' },
      { type: 'image', src: sceniq3, caption: "Individual task page." }
    ],
    repoStatus: 'private',
  },
  {
    title: 'ByteNet: Distributed Web Search Engine',
    shortLabel: 'ByteNet',
    description:
      'A distributed web search engine on a custom Java stack with a coordinator/worker cluster on AWS. Features a large-scale crawler (~500k URLs) with robots compliance, politeness limits, URL normalization, and deduplication, plus distributed indexing and ranking (inverted index, TF/IDF, PageRank).',
    link: null,
    shape: 'circle',
    position: { x: 18, y: 62 },
    icon: '/project_svgs/bytenet.svg',
    media: [
      { type: 'image', src: bytenetGif, caption: 'ByteNet demo preview.' },
      { type: 'pdf', src: bytenetReport, caption: 'ByteNet report.' },
    ],
    repoStatus: 'private',
  },
  {
    title: 'InstaLite: Instagram Clone + Semantic Search',
    shortLabel: 'InstaLite',
    description:
      'A full-stack Instagram clone on AWS (EC2 + RDS) with a relational schema and secure EC2 tunneling. Features posts/media, likes/comments/replies, hashtag feeds with infinite scroll, semantic profile search, and real-time chat via WebSockets. A production deployment workflow focused on reliability and cost control.',
    link: null,
    shape: 'circle',
    position: { x: 30, y: 34 },
    icon: '/project_svgs/instalite.svg',
    media: [
      { type: 'image', src: instalite1, caption: 'Profile view.' },
      { type: 'image', src: instalite2, caption: 'Sample image post.' },
      { type: 'pdf', src: instaliteReport, caption: 'InstaLite report.' }
    ],
    repoStatus: 'private',
  },
  {
    title: "Browser's Labyrinth",
    shortLabel: "Browser's Labyrinth",
    description:
      "A fully web-based game set inside a Windows 95-inspired world, built with custom physics and interactive window layouts. Navigate the labyrinth as a file, avoiding moving obstacles and reshaping the level by dragging borders. Focus: playful UX, collision systems, and puzzle-driven interactions.",
    hint:
      "Hint 2: The door doesn't open to force; only to time.",
    link: 'https://ahmedomuharram.github.io/browser-labyrinth/',
    shape: 'circle',
    position: { x: 8, y: 46 },
    icon: '/project_svgs/computer.svg',
    media: [
      { type: 'image', src: browsersLabyrinthGif, caption: 'Gameplay snippet and UI flow.' },
    ],
    repoStatus: null,
  },
  {
    title: 'PennOS: UNIX-like OS Simulator',
    shortLabel: 'PennOS',
    description:
      'PennOS is a UNIX-like OS simulator that recreates the core pieces of a real operating system in a compact, testable environment. It implements a UNIX-style process model on top of spthreads with PCB-managed state, per-process file descriptor tables, and a syscall layer that cleanly separates user-facing APIs from kernel helpers.\n\nScheduling is fully preemptive using SIGALRM with 100ms quanta and three priority queues, combining weighted scheduling, round-robin within queues, and starvation avoidance. The runtime also handles proper idle behavior and emits structured logs to make lifecycle and scheduling events traceable.\n\nThe filesystem is a PennFAT (FAT16-style) implementation stored inside a host file, backed by an mmap FAT region plus disk-like blocks for data. It supports open/read/write/seek/unlink semantics and is paired with a shell that includes built-ins (cat, echo, touch, etc.) and redirection. Together, these pieces make PennOS feel like a miniature UNIX environment that is still rigorous enough for systems experimentation.',
    link: null,
    shape: 'circle',
    position: { x: 70, y: 68 },
    icon: '/project_svgs/computer.svg',
    media: [],
    repoStatus: 'private',
  },
  {
    title: 'Mini-Minecraft — C++ / OpenGL',
    shortLabel: 'Mini-Minecraft',
    description:
      'A voxel-based 3D sandbox built in C++ with a real-time rendering pipeline. Features chunked world representation, camera controls, and interactive block placement. A graphics and performance project built around making complex systems feel smooth and responsive. Rendering, data structures, and real-time constraints.',
    link: null,
    shape: 'circle',
    position: { x: 52, y: 46 },
    icon: '/project_svgs/minecraft.svg',
    media: [
      { type: 'youtube', src: 'https://www.youtube.com/embed/iqWLD2N0JCs', caption: 'Mini-Minecraft demo.' },
    ],
    repoStatus: 'private',
  },
  {
    title: 'RV32IM Processor',
    shortLabel: 'RV32IM Processor',
    description:
      'This project involves building a RISC-V (RV32IM) processor using SystemVerilog and Verilator, starting with key components such as a register file, arithmetic logic unit (ALU), and divider unit. The processor implementation is divided into multiple pieces, each focusing on specific functionalities and optimizations.\n\nThe first milestones include implementing basic ALU instructions and branching operations, followed by supporting the remaining RV32IM instructions, including memory operations.\n\nA significant aspect of the project is pipelining, where the processor’s datapath is divided into stages to improve performance. Additionally, optimizations such as two-level Carry-LookAhead (CLA) adders and pipelining the divider unit are explored to enhance the processor’s efficiency.\n\nIntegration with a realistic memory model using the AXI4-Lite interface is also a crucial part of this project. Testing is conducted using predefined test cases like the Dhrystone test suite and benchmarks like WNS (Worst Negative Stack) and clock timing assessments to ensure correctness and evaluate performance.',
    link: null,
    shape: 'circle',
    position: { x: 82, y: 44 },
    icon: '/project_svgs/riscv.svg',
    repoStatus: 'private',
  },
  {
    title: 'Prodosphere',
    shortLabel: 'Prodosphere',
    description:
      'A browser-based productivity homepage with customizable widgets like to-do list, calendar, pomodoro timer, weather, notes, and bookmarks. Includes search, translation, music, currency/timezone tools, and personalized greetings to streamline daily workflows.',
    link: 'https://github.com/ahmedomuharram/prodosphere',
    shape: 'circle',
    position: { x: 90, y: 64 },
    icon: '/project_svgs/productivity.svg',
    media: [
      { type: 'image', src: prodosphereGif, caption: 'Prodosphere homepage preview.' },
    ],
    repoStatus: null,
  },
  {
    title: 'Bitcoin Price Prediction: Social Sentiment Signals',
    shortLabel: '$BTC Sentiment',
    description:
      'Whether Reddit and Twitter sentiment can provide predictive signal for BTC price movement. Data pipelines for text ingestion, feature extraction, and model training/evaluation. A practical study in noisy real-world data, spurious correlation, and robust validation. ML experimentation and signal vs noise.',
    hint: "Hint 1: Go south of where the signal uplinks.",
    link: null,
    shape: 'circle',
    position: { x: 40, y: 58 },
    icon: '/project_svgs/bitcoin.svg',
    media: [
      { type: 'image', src: btc1, caption: 'Random Forest Predictions vs. Actual Prices.', size: 'small' },
      { type: 'image', src: btc2, caption: 'All Models Predictions vs. Actual Prices.', size: 'small' },
    ],
    repoStatus: 'private',
  },
]

const nodeEdges = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [4, 5], [5, 6], [6, 7], [7, 8],
  [8, 0], [2, 6], [1, 7],
]

const ProjectsPage = () => {
  const [activeIndex, setActiveIndex] = useState(null)
  const [mediaIndex, setMediaIndex] = useState(0)
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 })
  const [offsets, setOffsets] = useState(() =>
    projectsData.map(() => ({ x: 0, y: 0 }))
  )
  const networkRef = useRef(null)
  const svgRef = useRef(null)
  const nodeRefs = useRef([])
  const lineRefs = useRef([])

  const seeds = useMemo(
    () => projectsData.map((_, i) => (i + 1) * 1.7),
    []
  )

  useEffect(() => {
    if (!networkRef.current) return
    const updateSize = () => {
      const rect = networkRef.current.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      setContainerSize({
        width: rect.width,
        height: rect.height,
      })
    }
    updateSize()
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setContainerSize({
        width: entry.contentRect.width || 1,
        height: entry.contentRect.height || 1,
      })
    })
    observer.observe(networkRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let raf = 0
    const updateLines = () => {
      const container = networkRef.current
      const svg = svgRef.current
      if (!container || !svg) {
        raf = requestAnimationFrame(updateLines)
        return
      }
      const containerRect = container.getBoundingClientRect()
      nodeEdges.forEach((edge, index) => {
        const [start, end] = edge
        const startNode = nodeRefs.current[start]
        const endNode = nodeRefs.current[end]
        const line = lineRefs.current[index]
        if (!startNode || !endNode || !line) return
        const startCore = startNode.querySelector('.project-node-core')
        const endCore = endNode.querySelector('.project-node-core')
        if (!startCore || !endCore) return
        const startRect = startCore.getBoundingClientRect()
        const endRect = endCore.getBoundingClientRect()
        const startCenter = {
          x: startRect.left + startRect.width / 2 - containerRect.left,
          y: startRect.top + startRect.height / 2 - containerRect.top,
        }
        const endCenter = {
          x: endRect.left + endRect.width / 2 - containerRect.left,
          y: endRect.top + endRect.height / 2 - containerRect.top,
        }
        const dx = endCenter.x - startCenter.x
        const dy = endCenter.y - startCenter.y
        const len = Math.hypot(dx, dy) || 1
        const nx = dx / len
        const ny = dy / len
        const radius = startRect.width / 2
        const x1 = startCenter.x + nx * radius
        const y1 = startCenter.y + ny * radius
        const x2 = endCenter.x - nx * radius
        const y2 = endCenter.y - ny * radius
        line.setAttribute('x1', x1)
        line.setAttribute('y1', y1)
        line.setAttribute('x2', x2)
        line.setAttribute('y2', y2)
      })
      raf = requestAnimationFrame(updateLines)
    }
    raf = requestAnimationFrame(updateLines)
    return () => cancelAnimationFrame(raf)
  }, [offsets])

  useEffect(() => {
    let raf = 0
    const animate = (time) => {
      const next = projectsData.map((_, i) => {
        const seed = seeds[i]
        const dx = Math.sin(time * 0.0006 + seed) * 6
        const dy = Math.cos(time * 0.00055 + seed * 1.3) * 5
        return { x: dx, y: dy }
      })
      setOffsets(next)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [seeds])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setActiveIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const activeProject = activeIndex !== null ? projectsData[activeIndex] : null
  const activeMedia = activeProject?.media?.[mediaIndex] ?? null

  useEffect(() => {
    setMediaIndex(0)
  }, [activeIndex])

  const handleMediaStep = (direction) => {
    if (!activeProject?.media?.length) return
    const total = activeProject.media.length
    const next = (mediaIndex + direction + total) % total
    setMediaIndex(next)
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h2>Projects</h2>
      </div>

      <div className="projects-network" ref={networkRef}>
        <svg
          ref={svgRef}
          className="projects-network-lines"
          viewBox={`0 0 ${Math.max(1, containerSize.width)} ${Math.max(1, containerSize.height)}`}
          preserveAspectRatio="none"
        >
          {nodeEdges.map((edge, index) => (
            <line key={`${edge[0]}-${edge[1]}`} ref={(el) => { lineRefs.current[index] = el }} />
          ))}
        </svg>

        {projectsData.map((project, index) => (
          <button
            key={project.title}
            type="button"
            className={`project-node shape-${project.shape}`}
            style={{
              left: `${project.position.x}%`,
              top: `${project.position.y}%`,
              '--dx': `${offsets[index]?.x ?? 0}px`,
              '--dy': `${offsets[index]?.y ?? 0}px`,
            }}
            onClick={() => setActiveIndex(index)}
            ref={(el) => { nodeRefs.current[index] = el }}
          >
            <span className="project-node-core">
              <img src={project.icon} alt="" aria-hidden="true" />
            </span>
            <span className="project-node-label">{project.shortLabel}</span>
          </button>
        ))}
      </div>

      <div className={`projects-modal ${activeProject ? 'is-open' : ''}`} onClick={() => setActiveIndex(null)}>
        <div className="projects-modal-card" onClick={(e) => e.stopPropagation()}>
          <button className="projects-modal-close" type="button" onClick={() => setActiveIndex(null)}>
            ×
          </button>
          {activeProject && (
            <>
              {activeMedia && (
                <div className="projects-media">
                  <div className="projects-media-frame">
                    {activeProject.media.length > 1 && (
                      <button
                        className="projects-media-nav prev"
                        type="button"
                        onClick={() => handleMediaStep(-1)}
                        aria-label="Previous media"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M14 6l-6 6 6 6" />
                        </svg>
                      </button>
                    )}
                    {activeMedia.type === 'image' && (
                      <img
                        src={activeMedia.src}
                        alt={activeMedia.caption}
                        className={`projects-media-image${activeMedia.size === 'small' ? ' is-small' : ''}`}
                      />
                    )}
                    {activeMedia.type === 'pdf' && (
                      <iframe title={activeMedia.caption} src={activeMedia.src} />
                    )}
                    {activeMedia.type === 'youtube' && (
                      <iframe
                        title={activeMedia.caption}
                        src={activeMedia.src}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                    {activeProject.media.length > 1 && (
                      <button
                        className="projects-media-nav next"
                        type="button"
                        onClick={() => handleMediaStep(1)}
                        aria-label="Next media"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M10 6l6 6-6 6" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="projects-media-caption">{activeMedia.caption}</div>
                  <div className="projects-media-dots" aria-hidden="true">
                    {activeProject.media.map((_, i) => (
                      <span key={i} className={`dot ${i === mediaIndex ? 'is-active' : ''}`} />
                    ))}
                  </div>
                </div>
              )}
              <h3>{activeProject.title}</h3>
              <p>{activeProject.description}</p>
              {activeProject.hint && (
                <p className="projects-hint">{activeProject.hint}</p>
              )}
              {activeProject.link ? (
                <a className="projects-link" href={activeProject.link} target="_blank" rel="noreferrer">
                  Visit project
                </a>
              ) : activeProject.repoStatus === 'private' ? (
                <span className="projects-link is-disabled">Private repo available upon request</span>
              ) : (
                <span className="projects-link is-disabled">Link coming soon</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectsPage
