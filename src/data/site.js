import fidInvst from '../assets/fid-invst.png'
import aydi from '../assets/aydi.png'
import orascom from '../assets/orascom.png'
import resume from '../assets/Public_Resume.pdf'
import pathfinderImage from '../assets/pathfinder.png'
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
import coverSceniq from '../assets/covers/sceniq.webp'
import coverBytenet from '../assets/covers/bytenet.webp'
import coverInstalite from '../assets/covers/instalite.webp'
import coverLabyrinth from '../assets/covers/labyrinth.webp'
import coverProdosphere from '../assets/covers/prodosphere.webp'
import coverBtc from '../assets/covers/btc.webp'

export const PROFILE = {
  name: 'Ahmed Muharram',
  role: 'AI / ML Engineer',
  focus: ['Systems', 'Scientific LLM agents', 'Retrieval'],
  location: 'Cairo, Egypt',
  resume,
  email: null,
  links: [
    { label: 'github', href: 'https://github.com/ahmedomuharram' },
    { label: 'linkedin', href: 'https://www.linkedin.com/in/ahmed-muharram' },
  ],
}

export const ABOUT = {
  paragraphs: [
    "i finished my bachelor's and master's in computer and information science at penn in may 2026. i went there on the onsi sawiris scholarship.",
    "most of my work sits where ai meets regular systems engineering. i care a lot about software being reliable and easy to understand for the people who actually use it.",
    "lately that has meant tool-calling llm agents for scientific work, and ai products that keep people's data private. i've worked in both research and industry, and i like working with people who care about doing things well.",
  ],
  facts: [
    { k: 'now', v: 'r&d software developer at orascom construction' },
    { k: 'school', v: "penn, bachelor's + master's in cis" },
    { k: 'scholarship', v: 'onsi sawiris scholar' },
    { k: 'award', v: 'penn engineering outstanding research award' },
  ],
}

export const EXPERIENCE = [
  {
    title: 'R&D Software Developer',
    company: 'Orascom Construction',
    short: 'Orascom',
    dates: 'Jul 2026 — Present',
    logo: orascom,
    current: true,
    note: 'Current position; more to come.',
  },
  {
    title: 'AI / ML Engineer',
    company: 'Fidelity Investments',
    short: 'Fidelity',
    dates: 'Dec 2025 — Jan 2026',
    logo: fidInvst,
    link: { phrase: 'previously developed system', target: 2 },
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
    short: 'Fidelity',
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
    short: 'Aydi',
    dates: 'Jun 2024 — Aug 2024',
    logo: aydi,
    bullets: [
      'Built a chatbot for agricultural business owners in low-connectivity environments, using Haystack, MongoDB Atlas, Redis, and GPT-4o-family models to deliver real-time analytics with 85%+ top-1 retrieval accuracy.',
      'Added four Jest test suites for JavaScript services and introduced token/latency monitoring with tiktoken to guide performance tuning and cost control.',
      'Reduced LLM spend by 96.25% by recommending a shift from GPT-4o to GPT-4o mini after a cost/quality analysis based on usage patterns.',
    ],
  },
]

export const THESIS = {
  title: 'How Underspecified Prompts Shape Tool-Calling LLM Agents in Scientific Workflows',
  venue: "Master's Thesis · University of Pennsylvania · 2026",
  classes: 'cs.CL · cs.AI',
  byline: 'Advised by Chris Callison-Burch · read by Eric Wong · with David S. Roos (VEuPathDB), Delip Rao & Andrew Zhu',
  award: 'Penn Engineering Outstanding Research Award',
  summary:
    "the short version: when people ask an agent for something, they leave details out, and the agent fills the gaps by guessing. i built two agents to test how much that matters, lamina for materials science and pathfinder for pathogen genomics. vague prompts hurt them more than model size or anything else i tried. in pathfinder, gene-set f1 went from 0.66 with precise prompts down to 0.16 with vague ones, and bigger models didn't fix it.",
  abstract: [
    'Tool-calling LLM agents can translate natural-language instructions into structured invocations of scientific APIs and databases, but natural language is inherently underspecified: researchers routinely omit dataset identifiers, parameter thresholds, and success criteria that downstream tools require. When this happens, the agent must infer or default missing tool parameters. This thesis studies how prompt underspecification shapes the behavior of such agents through two case studies: LAMINA, a 50-tool materials-science agent evaluated on 37 feasibility claims across three models, and PathFinder, a 44-tool pathogen-genomics agent evaluated on 35 gold-standard search strategies at three vagueness levels across two models and 420 total runs. Both are built on the Kani framework and are open source.',
    "Prompt underspecification was the dominant source of output instability in both case studies, outweighing the effects of model size, routing policy, and task complexity within the ranges evaluated here. In LAMINA, vague claims induce a flip rate of 0.43, meaning that alternate plausible interpretations of the same claim often produce different final labels. In PathFinder, removing dataset-level specification collapses gene-set F1 from 0.664 to 0.227, and further vagueness reduces it to 0.158. The instability localizes to the natural-language-to-tool-invocation mapping: tools function correctly once given precise inputs, but the agent's translation from the prompt into tool choices and arguments is unreliable, and in multi-step tasks these early mistakes propagate through later operations. Within the range of models evaluated here, model scaling does not currently compensate.",
    'We derive four design recommendations: disambiguation protocols, catalog grounding, incremental validation, and replicated evaluation designs.',
  ],
  stats: [
    { v: '0.43', k: 'flip rate on vague LAMINA claims' },
    { v: '0.66 → 0.16', k: 'PathFinder gene-set F1, precise → vague' },
    { v: '420', k: 'controlled PathFinder runs' },
  ],
  terms: 'LLM agents, tool calling, retrieval-augmented generation, agentic workflows, materials informatics, pathogen genomics, evaluation.',
  paper: 'https://drive.google.com/file/d/1pT22STsQXo0BKfvNUpkWZ2qmoOJ534rl/view?usp=sharing',
  defense: 'https://www.youtube.com/watch?v=atXx9LYXkus',
  figures: [
    {
      name: 'LAMINA',
      src: '/images/lamina.png',
      caption: 'an open-ended materials question compiled into a traceable, executable tool workflow.',
      blurb: 'A 50-tool materials-feasibility agent over CALPHAD, Materials Project DFT, and CHGNet neural surrogates. It turns open-ended feasibility questions into traceable, executable tool workflows, built for evaluation rather than one-shot answers.',
      href: 'https://github.com/ahmedomuharram/lamina',
    },
    {
      name: 'PathFinder',
      src: pathfinderImage,
      caption: 'a natural-language biology question approved as an executable WDK strategy graph.',
      blurb: 'A 44-tool pathogen-genomics agent that compiles natural-language questions into executable WDK strategy graphs (recursive ASTs of searches, Boolean operators, and ortholog transforms) across the 14-database VEuPathDB consortium. Built on a pydantic-ai and LangGraph pipeline (scoping, discovery, planning, execution, verification) with pgvector catalog grounding; now being integrated into the VEuPathDB platform.',
      href: 'https://github.com/ahmedomuharram/pathfinder',
    },
  ],
}

export const PUBLICATIONS = [
  {
    kind: 'Thesis',
    year: 2026,
    title: THESIS.title,
    venue: "penn, master's thesis",
    authors: 'ahmed muharram',
    note: THESIS.award,
    links: [
      { label: 'pdf', href: THESIS.paper },
      { label: 'defense talk', href: THESIS.defense },
      { label: 'lamina', href: 'https://github.com/ahmedomuharram/lamina' },
      { label: 'pathfinder', href: 'https://github.com/ahmedomuharram/pathfinder' },
    ],
  },
]

export const PROJECTS = [
  {
    title: 'ScenIQ: On-Prem Meeting Intelligence',
    short: 'ScenIQ',
    tags: ['FastAPI', 'Whisper', 'pgvector', 'React'],
    featured: true,
    description:
      'An on-prem, security-first meeting intelligence system that transforms video into transcripts, topics, and structured action items. The pipeline runs FFmpeg → speaker diarization → Whisper transcription → segmentation → action-item extraction. Python + FastAPI backend with PostgreSQL + pgvector, including speaker / org-chart embeddings for relationship-aware action assignment. Zoom/Teams ingestion, ClickUp/Jira outputs, React + TypeScript frontend, air-gapped / private-cloud deployment. Processes a 5-minute video in roughly 1-2 minutes.',
    hint: "Hint 3: Knowledge Occults Names; Ashes Map Intentions. this is the Clever Owl's oDE.",
    link: 'https://sceniq.app',
    cover: coverSceniq,
    media: [
      { type: 'image', src: sceniq1, caption: 'Action item graph overview and UI.' },
      { type: 'image', src: sceniq2, caption: 'Meeting page view.' },
      { type: 'image', src: sceniq3, caption: 'Individual task page.' },
    ],
    repoStatus: 'private',
  },
  {
    title: 'ByteNet: Distributed Web Search Engine',
    short: 'ByteNet',
    tags: ['Java', 'AWS EC2', 'PageRank', 'Distributed'],
    featured: true,
    description:
      'A distributed web search engine on a custom Java stack (webserver + distributed key-value store + RDD-style data-parallel framework) with a coordinator/worker cluster on AWS EC2. Features a production-grade crawler (~500k URLs) with robots.txt compliance, per-host rate limiting, URL normalization, and content-hash deduplication. Distributed indexing and ranking (TF-IDF inverted index + iterative PageRank) served via a /search JSON API.',
    link: null,
    cover: coverBytenet,
    media: [
      { type: 'image', src: bytenetGif, caption: 'ByteNet demo preview.' },
      { type: 'pdf', src: bytenetReport, caption: 'ByteNet report.' },
    ],
    repoStatus: 'private',
  },
  {
    title: 'InstaLite: Instagram Clone + Semantic Search',
    short: 'InstaLite',
    tags: ['AWS', 'WebSockets', 'Semantic search'],
    featured: true,
    description:
      'A full-stack Instagram clone on AWS (EC2 + RDS) with a relational schema and secure EC2 tunneling. Features posts/media, likes/comments/replies, hashtag feeds with infinite scroll, semantic profile search, and real-time chat via WebSockets. A production deployment workflow focused on reliability and cost control.',
    link: null,
    cover: coverInstalite,
    media: [
      { type: 'image', src: instalite1, caption: 'Profile view.' },
      { type: 'image', src: instalite2, caption: 'Sample image post.' },
      { type: 'pdf', src: instaliteReport, caption: 'InstaLite report.' },
    ],
    repoStatus: 'private',
  },
  {
    title: 'PennOS: UNIX-like OS Simulator',
    short: 'PennOS',
    tags: ['C', 'Scheduling', 'Filesystems'],
    featured: true,
    description:
      'PennOS is a UNIX-like OS simulator that recreates the core pieces of a real operating system in a compact, testable environment. It implements a UNIX-style process model on top of spthreads with PCB-managed state, per-process file descriptor tables, and a syscall layer that cleanly separates user-facing APIs from kernel helpers.\n\nScheduling is fully preemptive using SIGALRM with 100ms quanta and three priority queues, combining weighted scheduling, round-robin within queues, and starvation avoidance. The runtime also handles proper idle behavior and emits structured logs to make lifecycle and scheduling events traceable.\n\nThe filesystem is a PennFAT (FAT16-style) implementation stored inside a host file, backed by an mmap FAT region plus disk-like blocks for data. It supports open/read/write/seek/unlink semantics and is paired with a shell that includes built-ins (cat, echo, touch, etc.) and redirection. Together, these pieces make PennOS feel like a miniature UNIX environment that is still rigorous enough for systems experimentation.',
    link: null,
    cover: null,
    icon: '/project_svgs/computer.svg',
    media: [],
    repoStatus: 'private',
  },
  {
    title: "Browser's Labyrinth",
    short: "Browser's Labyrinth",
    tags: ['Game', 'Physics', 'Web'],
    description:
      "A fully web-based game set inside a Windows 95-inspired world, built with custom physics and interactive window layouts. Navigate the labyrinth as a file, avoiding moving obstacles and reshaping the level by dragging borders. Focus: playful UX, collision systems, and puzzle-driven interactions.",
    hint: "Hint 2: The door doesn't open to force; only to time.",
    link: 'https://ahmedomuharram.github.io/browser-labyrinth/',
    cover: coverLabyrinth,
    media: [{ type: 'image', src: browsersLabyrinthGif, caption: 'Gameplay snippet and UI flow.' }],
    repoStatus: null,
  },
  {
    title: 'Mini-Minecraft — C++ / OpenGL',
    short: 'Mini-Minecraft',
    tags: ['C++', 'OpenGL', 'Graphics'],
    description:
      'A voxel-based 3D sandbox built in C++ with a real-time rendering pipeline. Features chunked world representation, camera controls, and interactive block placement. A graphics and performance project built around making complex systems feel smooth and responsive. Rendering, data structures, and real-time constraints.',
    link: null,
    cover: null,
    icon: '/project_svgs/minecraft.svg',
    media: [{ type: 'youtube', src: 'https://www.youtube.com/embed/iqWLD2N0JCs', caption: 'Mini-Minecraft demo.' }],
    repoStatus: 'private',
  },
  {
    title: 'RV32IM Processor',
    short: 'RV32IM',
    tags: ['SystemVerilog', 'Verilator', 'Pipelining'],
    description:
      'This project involves building a RISC-V (RV32IM) processor using SystemVerilog and Verilator, starting with key components such as a register file, arithmetic logic unit (ALU), and divider unit. The processor implementation is divided into multiple pieces, each focusing on specific functionalities and optimizations.\n\nThe first milestones include implementing basic ALU instructions and branching operations, followed by supporting the remaining RV32IM instructions, including memory operations.\n\nA significant aspect of the project is pipelining, where the processor’s datapath is divided into stages to improve performance. Additionally, optimizations such as two-level Carry-LookAhead (CLA) adders and pipelining the divider unit are explored to enhance the processor’s efficiency.\n\nIntegration with a realistic memory model using the AXI4-Lite interface is also a crucial part of this project. Testing is conducted using predefined test cases like the Dhrystone test suite and benchmarks like WNS (Worst Negative Stack) and clock timing assessments to ensure correctness and evaluate performance.',
    link: null,
    cover: null,
    icon: '/project_svgs/riscv.svg',
    media: [],
    repoStatus: 'private',
  },
  {
    title: 'Prodosphere',
    short: 'Prodosphere',
    tags: ['JavaScript', 'Widgets', 'Productivity'],
    description:
      'A browser-based productivity homepage with customizable widgets like to-do list, calendar, pomodoro timer, weather, notes, and bookmarks. Includes search, translation, music, currency/timezone tools, and personalized greetings to streamline daily workflows.',
    link: 'https://github.com/ahmedomuharram/prodosphere',
    cover: coverProdosphere,
    media: [{ type: 'image', src: prodosphereGif, caption: 'Prodosphere homepage preview.' }],
    repoStatus: null,
  },
  {
    title: 'Bitcoin Price Prediction: Social Sentiment Signals',
    short: '$BTC Sentiment',
    tags: ['ML', 'NLP', 'Time series'],
    description:
      'Whether Reddit and Twitter sentiment can provide predictive signal for BTC price movement. Data pipelines for text ingestion, feature extraction, and model training/evaluation. A practical study in noisy real-world data, spurious correlation, and robust validation. ML experimentation and signal vs noise.',
    hint: 'Hint 1: Go south of where the letters are sent.',
    link: null,
    cover: coverBtc,
    media: [
      { type: 'image', src: btc1, caption: 'Random Forest Predictions vs. Actual Prices.', size: 'small' },
      { type: 'image', src: btc2, caption: 'All Models Predictions vs. Actual Prices.', size: 'small' },
    ],
    repoStatus: 'private',
  },
]

export const BOARD = {
  notes: EXPERIENCE.map((e) => ({ title: e.short, subtitle: e.title, meta: e.dates.replace(' — ', ' → ') })),
  polaroids: [
    { src: pathfinderImage, caption: 'pathfinder' },
    { src: '/images/lamina.png', caption: 'lamina' },
    { src: sceniq1, caption: 'sceniq' },
  ],
}
