import React, { useState, useEffect } from "react";

const HomePageWalkthroughModal = ({ isOpen, onClose }) => {
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
      title: "🏠 Homepage Overview",
      background: "/walkthroughImage.jpeg",
    },
    {
      id: "storage",
      title: "📊 Storage Management",
      background: "/walkthrough2.jpeg",
    },
    {
      id: "diagrams",
      title: "📋 Diagram Management",
      background: "/walkthroughImage.jpeg",
    },
    {
      id: "search",
      title: "🔍 Search & Sort",
      background: "/walkthrough2.jpeg",
    },
    {
      id: "create",
      title: "➕ Create New",
      background: "/walkthroughImage.jpeg",
    },
    {
      id: "actions",
      title: "⚙️ Actions & Settings",
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
              <h2 className="walkthrough-title">Homepage Features</h2>
              <p
                className={`walkthrough-description ${
                  isTransitioning ? "fade-out" : "fade-in"
                }`}
              >
                {activeSection === 0 &&
                  "Welcome to your FSM Designer homepage! This is your central hub for managing all your diagrams and accessing key features."}
                {activeSection === 1 &&
                  "Monitor your browser storage usage with the real-time gauge. See how much space your diagrams are using and clear storage when needed."}
                {activeSection === 2 &&
                  "View all your saved diagrams in organized cards. Each diagram shows its name, type, state count, and last modified date."}
                {activeSection === 3 &&
                  "Find diagrams quickly using the search bar. Sort by date, name, or number of states to organize your collection."}
                {activeSection === 4 &&
                  "Create new diagrams with the 'New Diagram' button. Choose from FSM, DFA, or NFA types to start your design."}
                {activeSection === 5 &&
                  "Access settings, help, and additional features. Use the UI walkthrough to learn more about the application."}
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

export default HomePageWalkthroughModal;
