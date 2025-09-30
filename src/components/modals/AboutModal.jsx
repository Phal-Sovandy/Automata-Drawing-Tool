import React from "react";

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content about-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <div className="modal-content-container">
          <div className="modal-top-row">
            <div className="modal-content-section">
              <i className="fas fa-compass-drafting modal-title-icon"></i>
              <div className="modal-title-content">
                <h2>FSM Designer</h2>
                <p className="modal-author">
                  by{" "}
                  <a
                    href="https://phalsovandy.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="author-link"
                  >
                    Phal Sovandy <i className="fas fa-external-link-alt"></i>
                  </a>
                </p>
              </div>
            </div>
            <div className="modal-buttons-section">
              <a
                href="https://www.buymeacoffee.com/phalsovandy"
                target="_blank"
                rel="noopener noreferrer"
                className="header-btn coffee-btn"
              >
                <i className="fas fa-coffee"></i>
                Buy me coffee
              </a>
              <a
                href="https://github.com/Phal-Sovandy/Automata-Drawing-Tools"
                target="_blank"
                rel="noopener noreferrer"
                className="header-btn git-btn"
              >
                <i className="fab fa-github"></i>
                Git Repository
              </a>
            </div>
            <div className="modal-description-section">
              <p className="modal-subtitle">
                Design beautiful state machines and diagrams with ease, speed
                and precision. A powerful tool for students, developers, and
                professionals to visualize complex systems and workflows.
              </p>
              <p className="modal-description-detail">
                Create, edit, and export beautiful state diagrams with ease.
                Perfect for learning automata theory, designing workflows, and
                documenting complex processes.
              </p>
            </div>
          </div>

          <div className="modal-separator"></div>

          <div className="modal-body">
            <div className="about-features">
              <h3>Key Features</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <i className="fas fa-mouse-pointer"></i>
                  <span>Interactive Design</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-undo"></i>
                  <span>Undo/Redo</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-download"></i>
                  <span>Multi-format Export</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-palette"></i>
                  <span>Custom Themes</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-keyboard"></i>
                  <span>Keyboard Shortcuts</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-save"></i>
                  <span>Auto-save</span>
                </div>
              </div>
            </div>

            <div className="about-tech">
              <div className="tech-header">
                <h3>Built With</h3>
                <div className="tech-stack">
                  <span className="tech-item">React</span>
                  <span className="tech-item">Vite</span>
                  <span className="tech-item">CSS3</span>
                  <span className="tech-item">IndexedDB</span>
                  <span className="tech-item">Cursor AI</span>
                </div>
              </div>
            </div>

            <div className="about-version">
              <span className="version-badge">v1.0.0</span>
              <p className="version-description">
                Built with love and shared with the community
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="social-links-footer">
            <a
              href="https://x.com/sovandy_phal"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-x-twitter social-link-icon"></i>
            </a>
            <a
              href="https://www.linkedin.com/in/sovandy-phal-382069331/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-linkedin social-link-icon"></i>
            </a>
            <a
              href="https://github.com/Phal-Sovandy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github social-link-icon"></i>
            </a>
            <a
              href="https://discordapp.com/users/696681524161937519"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-discord social-link-icon"></i>
            </a>
            <a
              href="mailto:phalsovandy007@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-envelope social-link-icon"></i>
            </a>
            <a
              href="https://t.me/l_Brilliant_l"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-telegram social-link-icon"></i>
            </a>
            <a
              href="https://web.facebook.com/kallMeDy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-facebook social-link-icon"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
