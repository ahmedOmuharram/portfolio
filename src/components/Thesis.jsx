import React, { useState } from "react";
import "./Thesis.css";
import pathfinderImage from "../assets/pathfinder.png";

// The two systems are presented as numbered research figures.
const figures = [
  {
    name: "LAMINA",
    src: "/images/lamina.png",
    caption:
      "an open-ended materials question compiled into a traceable, executable tool workflow.",
    blurb:
      "A 50-tool materials-feasibility agent over CALPHAD, Materials Project DFT, and CHGNet neural surrogates. It turns open-ended feasibility questions into traceable, executable tool workflows, built for evaluation rather than one-shot answers.",
    href: "https://github.com/ahmedomuharram/lamina",
  },
  {
    name: "PathFinder",
    src: pathfinderImage,
    caption:
      "a natural-language biology question approved as an executable WDK strategy graph.",
    blurb:
      "A 44-tool pathogen-genomics agent that compiles natural-language questions into executable WDK strategy graphs (recursive ASTs of searches, Boolean operators, and ortholog transforms) across the 14-database VEuPathDB consortium. Built on a pydantic-ai and LangGraph pipeline (scoping, discovery, planning, execution, verification) with pgvector catalog grounding; now being integrated into the VEuPathDB platform.",
    href: "https://github.com/ahmedomuharram/pathfinder",
  },
];

const PAPER_URL =
  "https://drive.google.com/file/d/1pT22STsQXo0BKfvNUpkWZ2qmoOJ534rl/view?usp=sharing";
const DEFENSE_URL = "https://www.youtube.com/watch?v=atXx9LYXkus";

const Thesis = () => {
  const [active, setActive] = useState(0);
  const last = figures.length - 1;
  const go = (dir) => setActive((i) => Math.max(0, Math.min(last, i + dir)));
  const fig = figures[active];

  return (
    <div className="thesis-container">
      <article className="thesis-paper">
        <header className="thesis-head">
          <div className="thesis-meta">
            <span className="thesis-class">cs.CL · cs.AI</span>
            <span className="thesis-venue">
              Master's Thesis · University of Pennsylvania · 2026
            </span>
          </div>
          <h2 className="thesis-title">
            How Underspecified Prompts Shape Tool-Calling LLM Agents in
            Scientific Workflows
          </h2>
          <p className="thesis-byline">
            <span className="thesis-author">Ahmed Muharram</span>
            <span className="thesis-advisors">
              Advised by Chris Callison-Burch · read by Eric Wong · with David S.
              Roos (VEuPathDB), Delip Rao &amp; Andrew Zhu
            </span>
          </p>
        </header>

        <div className="thesis-body">
          <section className="thesis-abstract">
            <p className="thesis-abstract-text">
              <span className="thesis-run-in">Abstract —</span>
              Tool-calling LLM agents can translate natural-language instructions
              into structured invocations of scientific APIs and databases, but
              natural language is inherently underspecified: researchers
              routinely omit dataset identifiers, parameter thresholds, and
              success criteria that downstream tools require. When this happens,
              the agent must infer or default missing tool parameters. This
              thesis studies how prompt underspecification shapes the behavior of
              such agents through two case studies: LAMINA, a 50-tool
              materials-science agent evaluated on 37 feasibility claims across
              three models, and PathFinder, a 44-tool pathogen-genomics agent
              evaluated on 35 gold-standard search strategies at three vagueness
              levels across two models and 420 total runs. Both are built on the
              Kani framework and are open source.
            </p>
            <p className="thesis-abstract-text">
              Prompt underspecification was the dominant source of output
              instability in both case studies, outweighing the effects of model
              size, routing policy, and task complexity within the ranges
              evaluated here. In LAMINA, vague claims induce a flip rate of 0.43,
              meaning that alternate plausible interpretations of the same claim
              often produce different final labels. In PathFinder, removing
              dataset-level specification collapses gene-set F1 from 0.664 to
              0.227, and further vagueness reduces it to 0.158. The instability
              localizes to the natural-language-to-tool-invocation mapping: tools
              function correctly once given precise inputs, but the agent&apos;s
              translation from the prompt into tool choices and arguments is
              unreliable, and in multi-step tasks these early mistakes propagate
              through later operations. Within the range of models evaluated
              here, model scaling does not currently compensate.
            </p>
            <p className="thesis-abstract-text">
              We derive four design recommendations: disambiguation protocols,
              catalog grounding, incremental validation, and replicated
              evaluation designs.
            </p>
          </section>

          <figure className="thesis-figure">
            <div className="thesis-plate">
              <span className="thesis-corner tl" aria-hidden="true" />
              <span className="thesis-corner tr" aria-hidden="true" />
              <span className="thesis-corner bl" aria-hidden="true" />
              <span className="thesis-corner br" aria-hidden="true" />
              {figures.map((f, i) => (
                <img
                  key={f.name}
                  src={f.src}
                  alt={`${f.name}: ${f.caption}`}
                  className={`thesis-plate-img${
                    i === active ? " is-active" : ""
                  }`}
                  draggable="false"
                />
              ))}
            </div>

            <figcaption className="thesis-figcaption">
              <span className="thesis-fig-label">Fig. {active + 1}.</span>{" "}
              <span className="thesis-fig-name">{fig.name}</span> — {fig.caption}
            </figcaption>

            <p className="thesis-fig-desc">{fig.blurb}</p>

            <div className="thesis-figure-foot">
              <div className="thesis-pager">
                <button
                  type="button"
                  className="thesis-pager-btn"
                  onClick={() => go(-1)}
                  disabled={active === 0}
                  aria-label="Previous figure"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
                <span className="thesis-pager-count">
                  {active + 1} / {figures.length}
                </span>
                <button
                  type="button"
                  className="thesis-pager-btn"
                  onClick={() => go(1)}
                  disabled={active === last}
                  aria-label="Next figure"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
              <a
                className="thesis-repo"
                href={fig.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {fig.name} on GitHub
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </figure>

          <div className="thesis-meta-block">
            <p className="thesis-terms">
              <span className="thesis-run-in-sm">Index Terms —</span>
              LLM agents, tool calling, retrieval-augmented generation, agentic
              workflows, materials informatics, pathogen genomics, evaluation.
            </p>
            <div className="thesis-resources">
              <a
                className="thesis-ref"
                href={PAPER_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="thesis-ref-num">[1]</span>
                <span>Read the thesis</span>
                <span className="thesis-ref-ext" aria-hidden="true">
                  ↗
                </span>
              </a>
              <a
                className="thesis-ref"
                href={DEFENSE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="thesis-ref-num">[2]</span>
                <span>Defense talk · May 2026</span>
                <span className="thesis-ref-ext" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Thesis;
