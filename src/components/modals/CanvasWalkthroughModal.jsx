import React, { useState, useEffect } from "react";
import canvasGuide1 from "../../assets/images/canvas-walkthrough/canvas_guide_1.png";
import canvasGuide2 from "../../assets/images/canvas-walkthrough/canvas_guide_2.png";
import canvasGuide3 from "../../assets/images/canvas-walkthrough/canvas_guide_3.png";
import canvasGuide4 from "../../assets/images/canvas-walkthrough/canvas_guide_4.png";
import canvasGuide5 from "../../assets/images/canvas-walkthrough/canvas_guide_5.png";
import canvasGuide6 from "../../assets/images/canvas-walkthrough/canvas_guide_6.png";
import canvasGuide7 from "../../assets/images/canvas-walkthrough/canvas_guide_7.png";

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
      title: "Canvas Workspace",
      icon: "fas fa-compass-drafting",
      background: canvasGuide1,
    },
    {
      id: "navigation",
      title: "Pan & Zoom Controls",
      icon: "fas fa-expand-arrows-alt",
      background: canvasGuide2,
    },
    {
      id: "states",
      title: "State Creation",
      icon: "fas fa-circle",
      background: canvasGuide3,
    },
    {
      id: "transitions",
      title: "Transition Drawing",
      icon: "fas fa-link",
      background: canvasGuide4,
    },
    {
      id: "customization",
      title: "Color & Styling",
      icon: "fas fa-palette",
      background: canvasGuide5,
    },
    {
      id: "tools",
      title: "Sidebar Tools",
      icon: "fas fa-bars",
      background: canvasGuide6,
    },
    {
      id: "export",
      title: "Save & Export",
      icon: "fas fa-save",
      background: canvasGuide7,
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
              <h2
                className={`walkthrough-title ${
                  isTransitioning ? "fade-out" : "fade-in"
                }`}
              >
                <i className={sections[activeSection].icon}></i>
                {sections[activeSection].title}
              </h2>
              <p
                className={`walkthrough-description ${
                  isTransitioning ? "fade-out" : "fade-in"
                }`}
              >
                {activeSection === 0 &&
                  "Your main workspace for creating automata diagrams. The canvas provides a clean, grid-based environment where you can design finite state machines, pushdown automata, and Turing machines with precision."}
                {activeSection === 1 &&
                  "Master canvas navigation with intuitive controls. Zoom in/out with mouse wheel or Cmd+/Cmd-, pan by holding space and dragging, and use fit-to-view to center your diagram. Navigate large diagrams effortlessly."}
                {activeSection === 2 &&
                  "Add states to your automaton by double-clicking on empty areas of the canvas. Drag to reposition states, double-click on states to toggle them as accept states, and use Shift+click to add self-transitions."}
                {activeSection === 3 &&
                  "Create transitions using Shift+drag: from state to state for regular transitions, from empty area to state for start transitions, and from empty area to empty area for standalone arrows. Add labels and use special symbols like ε (epsilon) for empty transitions."}
                {activeSection === 4 &&
                  "Personalize your diagrams with rich visual customization. Choose colors for states and transitions, apply different themes, and switch between light/dark modes to match your preference."}
                {activeSection === 5 &&
                  "Access the sidebar for essential tools and controls. Use the sidebar to manipulate states and transitions, undo/redo actions, rename diagrams, change diagram types, and adjust state radius size for your automata."}
                {activeSection === 6 &&
                  "Save and export your work in multiple formats. Export as PNG for presentations, SVG for scalability, LaTeX for academic papers, or JSON for sharing and collaboration."}
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
