import React, { useMemo } from 'react';

const Navbar = ({ onNavClick, currentIndex = 0, show = true }) => {
  const sections = useMemo(
    () => [
      { label: 'Home', index: 0 },
      { label: 'About', index: 1 },
      { label: 'Experience', index: 2 },
      { label: 'Thesis', index: 3 },
      { label: 'Projects', index: 4 },
      { label: 'Contact', index: 5 },
    ],
    []
  );

  const total = sections.length;
  const progress = total > 1 ? currentIndex / (total - 1) : 0;

  const handleClick = (e, index) => {
    e.preventDefault();
    onNavClick(index);
  };

  return (
    <nav
      className={`side-nav${show ? ' is-visible' : ''}`}
      aria-label="Section navigation"
      style={{ '--progress': progress }}
    >
      <ul className="side-nav-list">
        {sections.map((section) => {
          const isActive = section.index === currentIndex;
          return (
            <li key={section.label}>
              <button
                className={`side-nav-button${isActive ? ' is-active' : ''}`}
                onClick={(e) => handleClick(e, section.index)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Go to ${section.label}`}
              >
                <span className="side-nav-dot" aria-hidden="true" />
                <span className="side-nav-label">{section.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
