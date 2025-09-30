import React, { useState, useEffect } from "react";

const CanvasWalkthroughModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset to first section whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveSection(0);
    }
  }, [isOpen]);

  // Handle section change with fade transition
  const handleSectionChange = (newSection) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(newSection);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  };

  if (!isOpen) return null;

  const sections = [
    {
      id: "welcome",
      title: "🎨 Canvas Overview",
      background: "/walkthroughImage.jpeg",
    },
    {
      id: "navigation",
      title: "🖱️ Navigation & Zoom",
      background: "/walkthrough2.jpeg",
    },
    {
      id: "states",
      title: "🔵 Creating States",
      background: "/walkthroughImage.jpeg",
    },
    {
      id: "transitions",
      title: "➡️ Creating Transitions",
      background: "/walkthrough2.jpeg",
    },
    {
      id: "customization",
      title: "🎨 Visual Customization",
      background: "/walkthroughImage.jpeg",
    },
    {
      id: "tools",
      title: "🛠️ Canvas Tools",
      background: "/walkthrough2.jpeg",
    },
    {
      id: "export",
      title: "📤 Export & Save",
      background: "/walkthroughImage.jpeg",
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="scenic-walkthrough-modal">
        <button className="walkthrough-skip-top" onClick={onClose}>
          Skip now
        </button>
        <div
          className={`walkthrough-visual-section ${
            isTransitioning ? "background-fade" : ""
          }`}
          style={{
            backgroundImage: `url(${sections[activeSection].background})`,
          }}
        >
          <div className="walkthrough-background">
            <div className="walkthrough-stars">
              <div className="star star-1"></div>
              <div className="star star-2"></div>
              <div className="star star-3"></div>
              <div className="star star-4"></div>
              <div className="star star-5"></div>
              <div className="star star-6"></div>
              <div className="star star-7"></div>
              <div className="star star-8"></div>
            </div>
          </div>

          <div className="walkthrough-overlay">
            <div className="walkthrough-content">
              <h2 className="walkthrough-title">Canvas Features</h2>
              <p
                className={`walkthrough-description ${
                  isTransitioning ? "fade-out" : "fade-in"
                }`}
              >
                {activeSection === 0 &&
                  "Welcome to the FSM Designer canvas! This is your creative workspace where you'll build beautiful state machine diagrams."}
                {activeSection === 1 &&
                  "Navigate the canvas with zoom controls and panning. Use mouse wheel to zoom, space+drag to pan, and fit-to-view for optimal layout."}
                {activeSection === 2 &&
                  "Create states by clicking anywhere on the canvas. Double-click to edit names, drag to move, and customize colors and types."}
                {activeSection === 3 &&
                  "Connect states with transitions by dragging from one state to another. Add labels, customize curves, and use special characters like ε."}
                {activeSection === 4 &&
                  "Customize your diagrams with color pickers, themes, and visual styles. Switch between light and dark modes for your preference."}
                {activeSection === 5 &&
                  "Use canvas tools like grid, alignment, and selection tools. Access undo/redo, validation, and precision tools for professional results."}
                {activeSection === 6 &&
                  "Export your diagrams as PNG, SVG, PDF, or JSON. Save your work and share your state machines with others."}
              </p>

              <div className="walkthrough-actions">
                {activeSection > 0 && (
                  <button
                    className="walkthrough-back-button"
                    onClick={() => handleSectionChange(activeSection - 1)}
                    disabled={isTransitioning}
                  >
                    Go back
                  </button>
                )}

                <button
                  className="walkthrough-cta-button"
                  onClick={
                    activeSection === sections.length - 1
                      ? onClose
                      : () => handleSectionChange(activeSection + 1)
                  }
                  disabled={isTransitioning}
                >
                  {activeSection === sections.length - 1
                    ? "Start Creating!"
                    : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="slide-indicators">
          {sections.map((_, index) => (
            <button
              key={index}
              className={`slide-dot ${index === activeSection ? "active" : ""}`}
              onClick={() => handleSectionChange(index)}
              disabled={isTransitioning}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CanvasWalkthroughModal;
