import { useEffect, useRef, useState } from 'react';
import WireframeHand from './components/WireframeHand';
import WireframeTower from './components/WireframeTower';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactForm from './components/ContactForm';
import About from './components/About';
import Experience from './components/Experience';
import Thesis from './components/Thesis';
import Projects from './components/Projects';
import ThemeToggle from './components/ThemeToggle';
import SpaceBackground from './components/SpaceBackground';
import CrtFilter from './components/CrtFilter';
import ThemeVeil from './components/ThemeVeil';
import { useIsMobile } from './useIsMobile';
import './App.css';

const labels = ['home', 'about', 'experience', 'thesis', 'projects', 'contact'];

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const currentSectionRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const containerRef = useRef(null);
  const navHideTimeoutRef = useRef(null);
  const isMobile = useIsMobile();

  // Change section. Desktop = a layered slide-deck (each section is its own
  // full-screen layer; we just swap which one is active and the CSS crossfades
  // /slides between them). Mobile = a normal scrolling document.
  const goToSection = (sectionIndex) => {
    const total = labels.length;
    const clamped = Math.max(0, Math.min(total - 1, sectionIndex));

    if (isMobile) {
      const el = document.getElementById(labels[clamped]);
      el?.scrollIntoView({ behavior: 'smooth' });
      setCurrentIndex(clamped);
      return;
    }

    if (isAnimatingRef.current) return; // ignore input mid-transition
    if (clamped === currentSectionRef.current) return;

    isAnimatingRef.current = true;
    currentSectionRef.current = clamped;
    setCurrentIndex(clamped);
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 720); // match the CSS section transition
  };

  const revealNav = (hold = 1200) => {
    setShowNav(true);
    if (navHideTimeoutRef.current) clearTimeout(navHideTimeoutRef.current);
    navHideTimeoutRef.current = setTimeout(() => {
      setShowNav(false);
      navHideTimeoutRef.current = null;
    }, hold);
  };

  // Wheel → step one section at a time (desktop only).
  useEffect(() => {
    if (isMobile) return;
    let wheelCooldown = false;
    const handleWheel = (e) => {
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      e.preventDefault();
      revealNav();

      const threshold = 20; // ignore micro scrolls
      let next = currentSectionRef.current;
      if (!wheelCooldown && e.deltaY > threshold) {
        next = currentSectionRef.current + 1;
      } else if (!wheelCooldown && e.deltaY < -threshold) {
        next = currentSectionRef.current - 1;
      }
      if (next !== currentSectionRef.current) {
        goToSection(next);
        wheelCooldown = true;
        setTimeout(() => {
          wheelCooldown = false;
        }, 450);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isMobile]);

  // Keyboard navigation (desktop): arrows / page / home / end.
  useEffect(() => {
    if (isMobile) return;
    const onKey = (e) => {
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      let next = currentSectionRef.current;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') next += 1;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') next -= 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = labels.length - 1;
      else return;
      e.preventDefault();
      revealNav();
      goToSection(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile]);

  // Reveal the section rail when the cursor rests near the right edge, so it's
  // always reachable to click straight to a section (desktop).
  useEffect(() => {
    if (isMobile) return;
    const onMove = (e) => {
      const nearRight = e.clientX >= window.innerWidth - 90;
      if (nearRight) {
        setShowNav(true);
        if (navHideTimeoutRef.current) {
          clearTimeout(navHideTimeoutRef.current);
          navHideTimeoutRef.current = null;
        }
      } else if (!navHideTimeoutRef.current) {
        navHideTimeoutRef.current = setTimeout(() => {
          setShowNav(false);
          navHideTimeoutRef.current = null;
        }, 900);
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (navHideTimeoutRef.current) clearTimeout(navHideTimeoutRef.current);
    };
  }, [isMobile]);

  // Reset to the first section when switching in/out of mobile.
  useEffect(() => {
    currentSectionRef.current = 0;
    setCurrentIndex(0);
  }, [isMobile]);

  // Scroll-spy: keep the active section in sync while natively scrolling on mobile.
  useEffect(() => {
    if (!isMobile) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = labels.indexOf(entry.target.id);
            if (idx >= 0) {
              currentSectionRef.current = idx;
              setCurrentIndex(idx);
            }
          }
        });
      },
      { threshold: 0.5 },
    );
    labels.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    document.body.dataset.activeSection = labels[currentIndex] || 'home';
  }, [currentIndex]);

  // Active / above / below drive the layered slide transition on desktop.
  const stateClass = (i) =>
    i === currentIndex ? 'is-active' : i < currentIndex ? 'is-above' : 'is-below';

  return (
    <div className="App">
      <CrtFilter />
      <ThemeVeil />
      <SpaceBackground />
      {/* Rendered OUTSIDE .sections-container on purpose: a WebGL canvas inside the
          deck (a transform layer, plus an SVG filter in dark) gets snapshotted by
          the compositor and freezes on one frame. As a fixed sibling of the galaxy
          it composites live. It only renders while Contact is active. */}
      <WireframeTower active={currentIndex === 5} />
      <ThemeToggle />
      <Navbar onNavClick={goToSection} currentIndex={currentIndex} show={showNav} />
      <div className="sections-container" ref={containerRef}>
        <section className={`section hero ${stateClass(0)}`} id="home">
          <WireframeHand />
          <div className="hero-overlay">
            <p className="hero-role">
              AI / ML Engineer<span>·</span>Systems<span>·</span>Scientific LLM agents
            </p>
            <div className="hero-scroll" aria-hidden="true">
              <span>scroll</span>
              <span className="hero-scroll-line" />
            </div>
          </div>
        </section>
        <section className={`section about ${stateClass(1)}`} id="about">
          <About />
        </section>
        <section className={`section experience ${stateClass(2)}`} id="experience">
          <Experience />
        </section>
        <section className={`section thesis ${stateClass(3)}`} id="thesis">
          <Thesis />
        </section>
        <section className={`section projects ${stateClass(4)}`} id="projects">
          <Projects />
        </section>
        <section className={`section contact ${stateClass(5)}`} id="contact">
          <div className="contact-content">
            <div className="contact-shell">
              <div className="contact-header">
                <h2>Let’s connect</h2>
                <p>All inquiries welcome.</p>
              </div>
              <div className="contact-card">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default App;
