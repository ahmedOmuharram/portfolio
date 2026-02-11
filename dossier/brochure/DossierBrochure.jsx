import { useState, useRef } from "react";
import dossierLogo from "./dossier.png";

/* ─── small reusable pieces ──────────────────────────────── */

function FAQItem({ question, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`dossier-faq-item ${open ? "is-open" : ""}`}>
      <button className="dossier-faq-question" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="dossier-faq-chevron"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <div className="dossier-faq-answer">{children}</div>}
    </div>
  );
}

/* ─── icons (inline SVG keeps deps at zero) ──────────────── */

const Icons = {
  chat: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  question: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  file: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  upload: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#EC3107"
      strokeWidth="1.5"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  pulse: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  book: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  link: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  shield: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  clock: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  zap: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  prIcon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
    </svg>
  ),
  commitIcon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zm-1.43-.75a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z" />
    </svg>
  ),
  fileIcon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V4.664a.25.25 0 00-.073-.177l-2.914-2.914a.25.25 0 00-.177-.073H3.75z" />
    </svg>
  ),
  trendUp: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  messageBot: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  compass: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  terminal: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
};

/* ─── main page ──────────────────────────────────────────── */

export default function DossierBrochure() {
  const packetRef = useRef(null);

  /* ROI calculator */
  const [interviews, setInterviews] = useState(8);
  const [hoursPerInterview, setHoursPerInterview] = useState(2);
  const [percentDigging, setPercentDigging] = useState(30);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [showDollarValue, setShowDollarValue] = useState(true);

  const hoursSaved = (
    (interviews * hoursPerInterview * percentDigging) /
    100
  ).toFixed(1);
  const dollarsSaved = Math.round(hoursSaved * hourlyRate);

  const scrollToPacket = () =>
    packetRef.current?.scrollIntoView({ behavior: "smooth" });

  const openWaitlist = () => {
    window.location.href =
      "mailto:ahmed.o.muharram@gmail.com?subject=Dossier%20Waitlist&body=Hi%2C%20I%27d%20like%20to%20join%20the%20Dossier%20waitlist.%0A%0AName%3A%20%0AExpected%20interview%20timeline%3A%20";
  };

  return (
    <div className="dossier-page">
      {/* ━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="dossier-section dossier-hero">
        <div className="dossier-container">
          <img src={dossierLogo} alt="Dossier" className="dossier-logo" />
          <p className="dossier-tagline">Make the case for hiring you.</p>
          <p className="dossier-subheader">
            Stop blanking on your own work. Dossier turns your projects into a
            role-specific prep packet with citations you can rely on.
          </p>
          <div className="dossier-hero-ctas">
            <button
              className="dossier-btn dossier-btn-primary"
              onClick={openWaitlist}
            >
              Join the waitlist
            </button>
            <button
              className="dossier-btn dossier-btn-secondary"
              onClick={scrollToPacket}
            >
              See a sample packet
            </button>
          </div>
        </div>
      </section>

      {/* ━━━ THE PROBLEM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="dossier-section dossier-problem">
        <div className="dossier-container">
          <h2>You built it. Can you explain it under pressure?</h2>
          <ul className="dossier-problem-list">
            <li>
              You freeze when asked to walk through a project you built months
              ago
            </li>
            <li>
              Tradeoffs and implementation details blur together over time
            </li>
            <li>
              Interviewers reward specifics and clarity, but vague summaries
              don't cut it
            </li>
            <li>
              You spend hours digging through old PRs, commits, and notes before
              each round
            </li>
            <li>
              Your best work goes unmentioned because you forgot the details
            </li>
          </ul>
        </div>
      </section>

      {/* ━━━ WHAT DOSSIER IS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="dossier-section dossier-what">
        <div className="dossier-container">
          <h2>Your interview-ready preparation packet</h2>
          <p className="dossier-what-description">
            Dossier generates a structured preparation packet from your real
            work: your repos, your commits, your decisions. It's tailored to the
            role you're targeting so every talking point is relevant and every
            claim is backed by evidence.
          </p>

          <div className="dossier-what-features">
            <div className="dossier-feature-item">
              <div className="dossier-feature-icon">{Icons.chat}</div>
              <div>
                <strong>Role-tailored talking points</strong>
                <p>
                  Framed for the specific role you're interviewing for, not
                  generic summaries.
                </p>
              </div>
            </div>
            <div className="dossier-feature-item">
              <div className="dossier-feature-icon">{Icons.question}</div>
              <div>
                <strong>Deep-dive Q&A for your projects</strong>
                <p>
                  Anticipated questions with structured answers you can adapt on
                  the spot.
                </p>
              </div>
            </div>
            <div className="dossier-feature-item">
              <div className="dossier-feature-icon">{Icons.file}</div>
              <div>
                <strong>Evidence-linked "receipts"</strong>
                <p>
                  Citations to commits, PRs, and files so you can point to
                  proof, not just claims.
                </p>
              </div>
            </div>
            <div className="dossier-feature-item">
              <div className="dossier-feature-icon">{Icons.trendUp}</div>
              <div>
                <strong>Growth roadmap</strong>
                <p>
                  Actionable suggestions based on your actual code: patterns to
                  adopt, areas to sharpen, tools worth exploring. Fully
                  customizable to your goals.
                </p>
              </div>
            </div>
            <div className="dossier-feature-item">
              <div className="dossier-feature-icon">{Icons.messageBot}</div>
              <div>
                <strong>Dossier Assistant</strong>
                <p>
                  An interactive assistant that knows your codebase. Ask it
                  anything: why a decision was made, how something works under
                  the hood, or what it would look like if you'd done it
                  differently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="dossier-section dossier-how">
        <div className="dossier-container">
          <h2>Four steps to interview-ready</h2>

          <div className="dossier-steps">
            {/* Step 1 */}
            <div className="dossier-step-card">
              <div className="dossier-step-number">01</div>
              <div className="dossier-step-mock">
                <div className="dossier-mock-window">
                  <div className="dossier-mock-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="dossier-mock-content">
                    <div className="dossier-mock-icon">{Icons.upload}</div>
                    <div className="dossier-mock-text">Connect repos</div>
                    <div className="dossier-mock-subtext">
                      resume.pdf uploaded
                    </div>
                  </div>
                </div>
              </div>
              <h3>Connect your work</h3>
              <p>
                Link your repos and upload your resume. Optionally add your
                portfolio or a user-provided LinkedIn export.
              </p>
            </div>

            {/* Step 2 */}
            <div className="dossier-step-card">
              <div className="dossier-step-number">02</div>
              <div className="dossier-step-mock">
                <div className="dossier-mock-window">
                  <div className="dossier-mock-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="dossier-mock-content">
                    <div className="dossier-mock-roles">
                      <span className="dossier-mock-role">Backend SWE</span>
                      <span className="dossier-mock-role is-selected">
                        Full-stack
                      </span>
                      <span className="dossier-mock-role">ML SWE</span>
                      <span className="dossier-mock-role">Quant SWE</span>
                    </div>
                  </div>
                </div>
              </div>
              <h3>Pick your target role</h3>
              <p>
                Choose the role you're interviewing for. Your packet is tailored
                to what matters for that position.
              </p>
            </div>

            {/* Step 3 */}
            <div className="dossier-step-card">
              <div className="dossier-step-number">03</div>
              <div className="dossier-step-mock">
                <div className="dossier-mock-window">
                  <div className="dossier-mock-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="dossier-mock-content">
                    <div className="dossier-mock-generating">
                      <div className="dossier-mock-doc-lines">
                        <span style={{ width: "80%" }} />
                        <span style={{ width: "65%" }} />
                        <span style={{ width: "90%" }} />
                        <span style={{ width: "45%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3>Dossier generates your packet</h3>
              <p>
                Talking points, tradeoffs, deep dives, and citations, all
                pulled from your actual work.
              </p>
            </div>

            {/* Step 4 */}
            <div className="dossier-step-card">
              <div className="dossier-step-number">04</div>
              <div className="dossier-step-mock">
                <div className="dossier-mock-window">
                  <div className="dossier-mock-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="dossier-mock-content">
                    <div className="dossier-mock-checklist">
                      <div className="dossier-mock-check-item is-checked">
                        Review talking points
                      </div>
                      <div className="dossier-mock-check-item is-checked">
                        Study tradeoffs
                      </div>
                      <div className="dossier-mock-check-item">
                        Day-of quick reference
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3>Prep and answer confidently</h3>
              <p>
                Review the night before. Skim the morning of. Walk in knowing
                exactly what to say and where to point.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ PACKET PREVIEW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="dossier-section dossier-preview" ref={packetRef}>
        <div className="dossier-container">
          <h2>What you actually get</h2>
          <p className="dossier-preview-intro">
            Here's a preview of a Dossier packet generated for a Backend SWE
            role, based on a distributed task queue project.
          </p>

          <div className="dossier-packet">
            {/* packet chrome */}
            <div className="dossier-packet-header">
              <div className="dossier-packet-meta">
                <span className="dossier-packet-badge">DOSSIER PACKET</span>
                <span className="dossier-packet-role">Backend SWE</span>
              </div>
              <span className="dossier-packet-date">
                Generated Feb 10, 2026
              </span>
            </div>

            {/* ── Project Summary ── */}
            <div className="dossier-packet-card">
              <div className="dossier-packet-card-header">
                {Icons.book}
                <h3>Project Summary</h3>
                <span className="dossier-packet-tag">Role-tailored</span>
              </div>
              <div className="dossier-packet-card-body">
                <h4>Distributed Task Queue</h4>
                <p>
                  You designed and implemented a distributed task queue
                  supporting priority scheduling, retry logic, and dead-letter
                  handling. The system processes ~2,400 jobs/hour across 3
                  worker nodes with configurable concurrency per queue.
                </p>
                <div className="dossier-packet-points">
                  <strong>Key talking points</strong>
                  <ul>
                    <li>
                      Chose Redis-backed queue over SQS for sub-100ms scheduling
                      latency
                    </li>
                    <li>
                      Implemented exponential backoff with jitter for retry
                      logic
                    </li>
                    <li>
                      Built observability layer with per-queue metrics and
                      alerting
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ── Tradeoffs & Decisions ── */}
            <div className="dossier-packet-card">
              <div className="dossier-packet-card-header">
                {Icons.pulse}
                <h3>Tradeoffs &amp; Decisions</h3>
              </div>
              <div className="dossier-packet-card-body">
                <div className="dossier-packet-qa">
                  <div className="dossier-packet-q">
                    Why Redis over a managed queue service?
                  </div>
                  <div className="dossier-packet-a">
                    Needed sub-100ms scheduling for priority jobs. SQS
                    guarantees are on the order of seconds. Redis gave us the
                    latency profile we needed with acceptable durability
                    trade-offs, so we added WAL-based persistence as a safeguard.
                  </div>
                </div>
                <div className="dossier-packet-qa">
                  <div className="dossier-packet-q">
                    How did you handle worker failures mid-job?
                  </div>
                  <div className="dossier-packet-a">
                    Visibility timeout pattern: jobs return to the queue if not
                    acknowledged within a configurable window. Added idempotency
                    keys to prevent duplicate processing on re-delivery.
                  </div>
                </div>
              </div>
            </div>

            {/* ── Deep Dive Q&A ── */}
            <div className="dossier-packet-card">
              <div className="dossier-packet-card-header">
                {Icons.question}
                <h3>Deep Dive Q&amp;A</h3>
              </div>
              <div className="dossier-packet-card-body">
                <div className="dossier-packet-qa">
                  <div className="dossier-packet-q">
                    Walk me through how a job moves from submission to
                    completion.
                  </div>
                  <div className="dossier-packet-a">
                    Client submits a job via the REST endpoint. The job is
                    serialized and pushed to a priority-sorted set in Redis. The
                    scheduler pops the highest-priority job and assigns it to an
                    available worker via a channel. The worker executes the job,
                    then sends an ACK on success or a NACK for retry. If retries
                    are exhausted, the job moves to a dead-letter queue for
                    manual review.
                  </div>
                </div>
              </div>
            </div>

            {/* ── Receipts ── */}
            <div className="dossier-packet-card dossier-packet-receipts">
              <div className="dossier-packet-card-header">
                {Icons.link}
                <h3>Receipts</h3>
                <span className="dossier-packet-tag">Evidence</span>
              </div>
              <div className="dossier-packet-card-body">
                <div className="dossier-receipts-list">
                  <a
                    href="#"
                    className="dossier-receipt"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="dossier-receipt-icon dossier-receipt-pr">
                      {Icons.prIcon}
                    </span>
                    <span className="dossier-receipt-label">PR #142</span>
                    <span className="dossier-receipt-desc">
                      feat: add priority scheduling to task queue
                    </span>
                  </a>
                  <a
                    href="#"
                    className="dossier-receipt"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="dossier-receipt-icon dossier-receipt-commit">
                      {Icons.commitIcon}
                    </span>
                    <span className="dossier-receipt-hash">a13f8e2</span>
                    <span className="dossier-receipt-desc">
                      refactor retry logic with exponential backoff
                    </span>
                  </a>
                  <a
                    href="#"
                    className="dossier-receipt"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="dossier-receipt-icon dossier-receipt-file">
                      {Icons.fileIcon}
                    </span>
                    <span className="dossier-receipt-path">
                      /src/queue/scheduler.ts
                    </span>
                    <span className="dossier-receipt-lines">L45–L89</span>
                    <span className="dossier-receipt-desc">
                      Priority sorting implementation
                    </span>
                  </a>
                  <a
                    href="#"
                    className="dossier-receipt"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="dossier-receipt-icon dossier-receipt-file">
                      {Icons.fileIcon}
                    </span>
                    <span className="dossier-receipt-path">
                      /src/queue/worker.ts
                    </span>
                    <span className="dossier-receipt-lines">L120–L178</span>
                    <span className="dossier-receipt-desc">
                      Retry + dead-letter handling
                    </span>
                  </a>
                  <a
                    href="#"
                    className="dossier-receipt"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="dossier-receipt-icon dossier-receipt-pr">
                      {Icons.prIcon}
                    </span>
                    <span className="dossier-receipt-label">PR #156</span>
                    <span className="dossier-receipt-desc">
                      fix: race condition in concurrent job assignment
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* ── Growth Roadmap ── */}
            <div className="dossier-packet-card">
              <div className="dossier-packet-card-header">
                {Icons.compass}
                <h3>Growth Roadmap</h3>
                <span className="dossier-packet-tag">Customizable</span>
              </div>
              <div className="dossier-packet-card-body">
                <div className="dossier-roadmap-list">
                  <div className="dossier-roadmap-item">
                    <span className="dossier-roadmap-category">Code quality</span>
                    <span className="dossier-roadmap-suggestion">
                      Several handler functions in <code>/src/queue/worker.ts</code> repeat
                      retry logic inline. Extracting a shared <code>withRetry()</code> wrapper
                      would reduce duplication and make retry policy changes one-line updates.
                    </span>
                  </div>
                  <div className="dossier-roadmap-item">
                    <span className="dossier-roadmap-category">Scalability</span>
                    <span className="dossier-roadmap-suggestion">
                      The current single-Redis setup works at ~2,400 jobs/hr. For 10x
                      throughput, consider partitioning queues across Redis Cluster nodes
                      or evaluating a dedicated broker like NATS JetStream.
                    </span>
                  </div>
                  <div className="dossier-roadmap-item">
                    <span className="dossier-roadmap-category">Stack</span>
                    <span className="dossier-roadmap-suggestion">
                      Your observability layer uses custom metrics. Adopting OpenTelemetry
                      would give you standardized tracing and make it easier to plug into
                      Grafana, Datadog, or Honeycomb down the line.
                    </span>
                  </div>
                  <div className="dossier-roadmap-item">
                    <span className="dossier-roadmap-category">Patterns</span>
                    <span className="dossier-roadmap-suggestion">
                      The scheduler reads configuration at startup only. A hot-reload
                      pattern (watch a config source, apply changes without restart) would
                      reduce downtime during tuning.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Dossier Assistant ── */}
            <div className="dossier-packet-card dossier-packet-assistant">
              <div className="dossier-packet-card-header">
                {Icons.terminal}
                <h3>Dossier Assistant</h3>
                <span className="dossier-packet-tag">Interactive</span>
              </div>
              <div className="dossier-packet-card-body">
                <div className="dossier-chat">
                  <div className="dossier-chat-msg dossier-chat-user">
                    <span className="dossier-chat-role">You</span>
                    <p>Why did I use a sorted set instead of a list for the priority queue?</p>
                  </div>
                  <div className="dossier-chat-msg dossier-chat-assistant">
                    <span className="dossier-chat-role">Dossier</span>
                    <p>
                      In <code>/src/queue/scheduler.ts:L52–L67</code>, you use a Redis ZSET
                      scored by priority + timestamp. A LIST would only give you FIFO
                      ordering, so you'd need to scan the entire list to find the
                      highest-priority job. The ZSET gives O(log N) insertion and O(1)
                      pop-min, which keeps scheduling under 1ms even at 10k queued jobs.
                    </p>
                  </div>
                  <div className="dossier-chat-msg dossier-chat-user">
                    <span className="dossier-chat-role">You</span>
                    <p>What would it look like if I used RabbitMQ instead of Redis?</p>
                  </div>
                  <div className="dossier-chat-msg dossier-chat-assistant">
                    <span className="dossier-chat-role">Dossier</span>
                    <p>
                      RabbitMQ has native priority queue support (up to 255 levels), so
                      you'd drop the ZSET logic entirely and declare a priority queue with
                      <code>x-max-priority</code>. Producers attach a priority header per
                      message. You'd gain built-in persistence and consumer acks, but lose
                      the sub-1ms scheduling latency. Expect 5–15ms per dequeue. For your
                      current volume (~2,400/hr) that's fine; it becomes a factor above ~50k/hr.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ BENEFITS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="dossier-section dossier-benefits">
        <div className="dossier-container">
          <h2>What changes for you</h2>

          <div className="dossier-benefits-grid">
            {/* Recall */}
            <div className="dossier-benefit-card">
              <div className="dossier-benefit-icon">{Icons.shield}</div>
              <h3>Recall under pressure</h3>
              <p>
                Walk into every round with your project details fresh and
                organized. No more blanking mid-answer.
              </p>
              <div className="dossier-benefit-stats">
                <span className="dossier-benefit-stat">
                  Answer follow-ups with specifics instead of vague summaries
                </span>
                <span className="dossier-benefit-stat">
                  Feel prepared, not panicked, 10 minutes before the call
                </span>
              </div>
            </div>

            {/* Credibility */}
            <div className="dossier-benefit-card">
              <div className="dossier-benefit-icon">{Icons.zap}</div>
              <h3>Credibility and defensibility</h3>
              <p>
                Every talking point links back to real evidence: commits, PRs,
                lines of code. Claims become provable.
              </p>
              <div className="dossier-benefit-stats">
                <span className="dossier-benefit-stat">
                  Point to exact PRs when asked "show me"
                </span>
                <span className="dossier-benefit-stat">
                  Turn "I think I…" into "here's the commit"
                </span>
              </div>
            </div>

            {/* Faster prep */}
            <div className="dossier-benefit-card">
              <div className="dossier-benefit-icon">{Icons.clock}</div>
              <h3>Faster prep</h3>
              <p>
                Stop spending hours hunting through old PRs and Slack threads.
                Your packet is ready when you need it.
              </p>
              <div className="dossier-benefit-stats">
                <span className="dossier-benefit-stat">
                  Reduce time spent digging for proof
                </span>
                <span className="dossier-benefit-stat">
                  Re-use the same packet across multiple interview cycles
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ WHO IT'S FOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="dossier-section dossier-audience">
        <div className="dossier-container">
          <h2>Built for people with real work to show</h2>

          <div className="dossier-audience-grid">
            <div className="dossier-audience-item">
              <div className="dossier-audience-marker" />
              <div>
                <strong>Early-career engineers</strong>
                <p>
                  You have projects you're proud of. Now make sure you can talk
                  about them clearly when it matters most.
                </p>
              </div>
            </div>
            <div className="dossier-audience-item">
              <div className="dossier-audience-marker" />
              <div>
                <strong>Career switchers</strong>
                <p>
                  Pivoting into SWE with one or two major projects? Dossier
                  helps you frame that work for technical interviews.
                </p>
              </div>
            </div>
            <div className="dossier-audience-item">
              <div className="dossier-audience-marker" />
              <div>
                <strong>Repeat-cycle candidates</strong>
                <p>
                  International students or anyone going through multiple
                  interview cycles. Prep once, reuse across rounds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="dossier-section dossier-faq">
        <div className="dossier-container">
          <h2>Common questions</h2>

          <div className="dossier-faq-list">
            <FAQItem question="Why not just paste my repo into ChatGPT?">
              You can, and you'll get a generic summary that doesn't map to a
              specific role, doesn't cite evidence, and isn't structured for
              recall under pressure. Dossier produces a reusable, role-tailored
              packet with linked citations you can reference in real time. It's
              the difference between a wall of text and a prep brief.
            </FAQItem>

            <FAQItem question="What if my repo is private?">
              You control what Dossier accesses. Connect only the repos you
              choose, and we only read what you explicitly grant access to.
              Nothing is shared or made public.
            </FAQItem>

            <FAQItem question="Do you store my code?">
              We process your code to generate the packet, but you have full
              control over your data. You can request deletion at any time.
              We're building with privacy-first principles: your code is yours.
            </FAQItem>

            <FAQItem question="Is this interview coaching?">
              No. Dossier is a preparation packet and recall assistant, not a
              coach, not a mock-interview platform, and not an algorithm tutor.
              Think of it as the brief you wish you had the night before.
            </FAQItem>

            <FAQItem question="Can I use the same packet for multiple companies?">
              Yes. Your packet is tailored to a role type (e.g., Backend SWE),
              not a specific company. Use it across every interview in that
              cycle. If you switch target roles, generate a new packet.
            </FAQItem>

            <FAQItem question="What can I ask the Dossier Assistant?">
              Anything about your own code. Why you made a certain decision,
              how a module works under the hood, what it would look like with a
              different tool or pattern, or how to explain a concept to an
              interviewer. It knows your repos, so you don't have to re-explain
              context every time.
            </FAQItem>

            <FAQItem question="Are the growth suggestions prescriptive?">
              No. They're starting points you can customize, dismiss, or
              prioritize. Dossier flags patterns worth thinking about, and you
              decide what's relevant to your goals and target role.
            </FAQItem>
          </div>
        </div>
      </section>

      {/* ━━━ ROI CALCULATOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="dossier-section dossier-roi">
        <div className="dossier-container">
          <h2>How much prep time could you save?</h2>
          <p>
            A rough estimate based on typical interview cycles. Adjust the
            inputs to match your situation.
          </p>

          <div className="dossier-roi-widget">
            <div className="dossier-roi-inputs">
              <div className="dossier-roi-field">
                <label>Interviews per cycle</label>
                <div className="dossier-roi-field-row">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={interviews}
                    onChange={(e) => setInterviews(Number(e.target.value))}
                  />
                  <span className="dossier-roi-value">{interviews}</span>
                </div>
              </div>

              <div className="dossier-roi-field">
                <label>Hours prep per interview</label>
                <div className="dossier-roi-field-row">
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    value={hoursPerInterview}
                    onChange={(e) =>
                      setHoursPerInterview(Number(e.target.value))
                    }
                  />
                  <span className="dossier-roi-value">
                    {hoursPerInterview}h
                  </span>
                </div>
              </div>

              <div className="dossier-roi-field">
                <label>% time digging for proof / recall</label>
                <div className="dossier-roi-field-row">
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="5"
                    value={percentDigging}
                    onChange={(e) => setPercentDigging(Number(e.target.value))}
                  />
                  <span className="dossier-roi-value">{percentDigging}%</span>
                </div>
              </div>

              <div className="dossier-roi-field">
                <label className="dossier-roi-toggle-label">
                  <span>Your hourly rate ($)</span>
                  <button
                    type="button"
                    className={`dossier-roi-toggle ${showDollarValue ? 'is-on' : ''}`}
                    onClick={() => setShowDollarValue(!showDollarValue)}
                    aria-label="Toggle hourly rate"
                  >
                    <span className="dossier-roi-toggle-knob" />
                  </button>
                </label>
                {showDollarValue && (
                  <div className="dossier-roi-field-row">
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="5"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                    />
                    <span className="dossier-roi-value">${hourlyRate}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="dossier-roi-results">
              <div className="dossier-roi-result">
                <div className="dossier-roi-result-number">{hoursSaved}h</div>
                <div className="dossier-roi-result-label">
                  Estimated hours saved
                </div>
              </div>
              {showDollarValue && (
                <div className="dossier-roi-result">
                  <div className="dossier-roi-result-number">${dollarsSaved}</div>
                  <div className="dossier-roi-result-label">
                    Estimated value of time saved
                  </div>
                </div>
              )}
            </div>
            <p className="dossier-roi-disclaimer">
              * This is a rough estimate for illustration purposes only. Your
              actual time savings will depend on your projects and interview
              process.
            </p>
          </div>
        </div>
      </section>

      {/* ━━━ CTA FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="dossier-section dossier-cta-footer">
        <div className="dossier-container">
          <h2>Ready to prep with proof?</h2>
          <p>Join the waitlist and be the first to get your Dossier packet.</p>
          <button
            className="dossier-btn dossier-btn-primary"
            onClick={openWaitlist}
          >
            Join the waitlist
          </button>
          <p className="dossier-cta-subline">
            We're talking to early-career engineers. If you're interviewing
            within 90 days, we'd love to hear from you.
          </p>
        </div>
      </section>
    </div>
  );
}
