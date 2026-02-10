import React, { useRef, useState } from "react";
import "./Thesis.css";
import pathfinderImage from "../assets/pathfinder.png";

const thesisMedia = {
  lamina: {
    src: "/images/lamina.png",
    caption: "Sample question and phase diagram output.",
  },
  pathfinder: { src: pathfinderImage, caption: "Strategy graph build-out." },
};

const Thesis = () => {
  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll(".thesis-media-card"));
    if (!cards.length) return;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 24;
    const step = cardWidth + gap;
    const maxIndex = cards.length - 1;
    const nextIndex = Math.max(0, Math.min(maxIndex, activeIndex + direction));
    track.scrollTo({ left: nextIndex * step, behavior: "smooth" });
    setActiveIndex(nextIndex);
  };

  const handlePointerDown = (event) => {
    const track = trackRef.current;
    if (!track) return;
    if (event.target.closest("a")) return;
    isDraggingRef.current = true;
    startXRef.current = event.clientX;
    startScrollRef.current = track.scrollLeft;
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const track = trackRef.current;
    if (!track || !isDraggingRef.current) return;
    const dx = event.clientX - startXRef.current;
    track.scrollLeft = startScrollRef.current - dx * 30;
  };

  const handlePointerUp = (event) => {
    const track = trackRef.current;
    if (!track) return;
    isDraggingRef.current = false;
    track.classList.remove("is-dragging");
    track.releasePointerCapture(event.pointerId);
    const cards = Array.from(track.querySelectorAll(".thesis-media-card"));
    if (!cards.length) return;
    const first = cards[0].getBoundingClientRect();
    const second = cards[1]?.getBoundingClientRect();
    const step = second
      ? Math.round(second.left - first.left)
      : Math.round(first.width);
    let targetIndex = Math.round(track.scrollLeft / step);
    const maxIndex = cards.length - 1;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex > maxIndex) targetIndex = maxIndex;
    track.scrollTo({ left: targetIndex * step, behavior: "smooth" });
    setActiveIndex(targetIndex);
  };

  return (
    <div className="thesis-container">
      <div className="thesis-split">
        <div className="thesis-copy">
          <h2>
            How Underspecified Prompts Shape Tool-Calling LLM Agents in
            Scientific Workflows
          </h2>
          <p>
            Case studies in materials science and eukaryotic pathogen
            informatics, focused on how vague language and underspecified
            prompts shape agent planning, tool selection, and failure modes.
          </p>
          <a
            className="thesis-link"
            href="#"
            onClick={(event) => event.preventDefault()}
          >
            Paper: Expected May 2026
            <span className="thesis-link-icon" aria-hidden="true">
              ↗
            </span>
          </a>
          <div className="thesis-authors">
            Ahmed Muharram, Chris Callison-Burch, David S. Roos, Delip Rao
          </div>
        </div>

        <div className="thesis-media">
          <div className="thesis-scroll-hint" aria-hidden="true">
            <span>←</span>
            <span>Swipe</span>
            <span>→</span>
          </div>
          <div className="thesis-media-nav">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous card"
              disabled={activeIndex === 0}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next card"
              disabled={activeIndex === 1}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div
            className="thesis-media-track"
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="thesis-media-card">
              <figure>
                <img
                  src={thesisMedia.lamina.src}
                  alt={thesisMedia.lamina.caption}
                />
                <figcaption>{thesisMedia.lamina.caption}</figcaption>
              </figure>
              <div className="thesis-media-body">
                <div className="thesis-card-title">LAMINA</div>
                <p>
                  An agentic system that translates open-ended scientific
                  questions into executable tool workflows across materials
                  databases and simulations. Built for traceability, evaluation,
                  and reliable orchestration over one-shot answers.
                </p>
                <div className="thesis-card-links">
                  <a
                    href="https://github.com/ahmedomuharram/lamina"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="thesis-media-card">
              <figure>
                <img
                  src={thesisMedia.pathfinder.src}
                  alt={thesisMedia.pathfinder.caption}
                />
                <figcaption>{thesisMedia.pathfinder.caption}</figcaption>
              </figure>
              <div className="thesis-media-body">
                <div className="thesis-card-title">PATHFINDER</div>
                <p>
                  A conversational planner that turns natural-language intent
                  into a step-by-step strategy graph for pathogen data
                  exploration. Designed to reduce trial-and-error while keeping
                  reasoning transparent and reproducible.
                </p>
                <div className="thesis-card-links">
                  <a
                    href="https://github.com/ahmedomuharram/pathfinder"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thesis;
