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
import './App.css';

function App() {
  // Track the current section index and animation state using refs
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const currentSectionRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const containerRef = useRef(null);
  const navHideTimeoutRef = useRef(null);

  // Centralized function to change section
  const goToSection = (sectionIndex) => {
    if (isAnimatingRef.current) return; // Prevent overlapping animations

    const total = containerRef.current?.childElementCount || 0;
    if (total === 0) return;
    // Normalize to circular index space
    const normalizedIndex = ((sectionIndex % total) + total) % total;

    isAnimatingRef.current = true;
    currentSectionRef.current = normalizedIndex;
    setCurrentIndex(normalizedIndex);
    if (containerRef.current) {
      containerRef.current.style.transform = `translateY(-${normalizedIndex * 100}vh)`;
    }

    // Reset animation flag after the transition (match with your CSS transition duration)
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 1000);
  };

  // Handle wheel events
  useEffect(() => {
    let wheelCooldown = false;
    const handleWheel = (e) => {
      e.preventDefault();
      setShowNav(true);
      if (navHideTimeoutRef.current) {
        clearTimeout(navHideTimeoutRef.current);
      }
      navHideTimeoutRef.current = setTimeout(() => {
        setShowNav(false);
      }, 1200);

      const totalSections = containerRef.current?.childElementCount || 0;
      let nextSection = currentSectionRef.current;
      const threshold = 20; // ignore micro scrolls
      if (!wheelCooldown && e.deltaY > threshold) {
        nextSection = (currentSectionRef.current + 1) % totalSections;
      } else if (!wheelCooldown && e.deltaY < -threshold) {
        nextSection = (currentSectionRef.current - 1 + totalSections) % totalSections;
      }
      if (nextSection !== currentSectionRef.current) {
        goToSection(nextSection);
        wheelCooldown = true;
        setTimeout(() => {
          wheelCooldown = false;
        }, 450);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (navHideTimeoutRef.current) {
        clearTimeout(navHideTimeoutRef.current);
      }
    };
  }, []);

  // Ensure we start at the first section explicitly without animation
  useEffect(() => {
    currentSectionRef.current = 0;
    setCurrentIndex(0);
    if (containerRef.current) {
      containerRef.current.style.transform = 'translateY(0)';
    }
  }, []);

  useEffect(() => {
    const labels = ['home', 'about', 'experience', 'thesis', 'projects', 'contact'];
    document.body.dataset.activeSection = labels[currentIndex] || 'home';
  }, [currentIndex]);

  return (
    <div className="App">
      <Navbar
        onNavClick={goToSection}
        currentIndex={currentIndex}
        show={showNav}
      />
      <div className="sections-container" ref={containerRef}>
        <section className="section hero" id="home">
          <WireframeHand />
        </section>
        <section className="section about" id="about">
          <About />
        </section>
        <section className="section experience" id="experience">
          <Experience />
        </section>
        <section className="section thesis" id="thesis">
          <Thesis />
        </section>
        <section className="section projects" id="projects">
          <Projects />
        </section>
        <section className="section contact" id="contact">
          <WireframeTower />
          <div className="contact-content">
            <div className="contact-shell">
              <div className="contact-header">
                <h2>Let’s connect</h2>
                <p>
                  All inquiries welcome.
                </p>
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
