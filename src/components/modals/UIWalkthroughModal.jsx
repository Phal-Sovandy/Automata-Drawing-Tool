import React, { useState, useEffect } from "react";

const UIWalkthroughModal = ({ isOpen, onClose }) => {
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
      id: "homepage",
      title: "🏠 Homepage Interface",
      icon: "fas fa-home",
      background: "/walkthroughImage.jpeg",
    },
    {
      id: "canvas",
      title: "🎨 Canvas Editor",
      icon: "fas fa-paint-brush",
      background: "/walkthrough2.jpeg",
    },
    {
      id: "states",
      title: "🔵 Creating States",
      icon: "fas fa-circle",
      background: "/walkthroughImage.jpeg",
    },
    {
      id: "transitions",
      title: "➡️ Creating Transitions",
      icon: "fas fa-arrow-right",
      background: "/walkthrough2.jpeg",
    },
    {
      id: "customization",
      title: "🎨 Visual Customization",
      icon: "fas fa-palette",
      background: "/walkthroughImage.jpeg",
    },
    {
      id: "export",
      title: "📤 Export Options",
      icon: "fas fa-download",
      background: "/walkthrough2.jpeg",
    },
    {
      id: "shortcuts",
      title: "⌨️ Keyboard Shortcuts",
      icon: "fas fa-keyboard",
      background: "/walkthroughImage.jpeg",
    },
    {
      id: "quickstart",
      title: "🎯 Quick Start Guide",
      icon: "fas fa-rocket",
      background: "/walkthrough2.jpeg",
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
              <h2 className="walkthrough-title">FSM Designer</h2>
              <p
                className={`walkthrough-description ${
                  isTransitioning ? "fade-out" : "fade-in"
                }`}
              >
                {activeSection === 0 &&
                  "Create beautiful state machines and diagrams with our intuitive interface. Learn all the essential features to get started."}
                {activeSection === 1 &&
                  "The canvas is your creative workspace. Add states, create transitions, and build complex finite state machines with precision."}
                {activeSection === 2 &&
                  "States are the foundation of your FSM. Click anywhere on the canvas to add states, then customize their appearance and behavior."}
                {activeSection === 3 &&
                  "Transitions show how your states connect. Drag from one state to another to create transitions, then add meaningful labels."}
                {activeSection === 4 &&
                  "Customize colors, themes, and appearance to make your diagrams stand out. Choose from light and dark themes."}
                {activeSection === 5 &&
                  "Export your diagrams in multiple formats. Create high-quality images, print-ready PDFs, or share as JSON data."}
                {activeSection === 6 &&
                  "Speed up your workflow with essential keyboard shortcuts. Undo, redo, and navigate efficiently."}
                {activeSection === 7 &&
                  "You now know the essentials of FSM Designer. Start creating your first state machine and explore all the powerful features."}
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
                    ? "Get Started!"
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

export default UIWalkthroughModal;
