import React, { useState, useEffect } from "react";
import homeGuide1 from "../../assets/images/homepage-walkthrough/Home-guide-1.png";
import homeGuide2 from "../../assets/images/homepage-walkthrough/Home-guide-2.png";
import homeGuide3 from "../../assets/images/homepage-walkthrough/Home-guide-3.png";
import homeGuide4 from "../../assets/images/homepage-walkthrough/Home-guide-4.png";
import homeGuide5 from "../../assets/images/homepage-walkthrough/Home-guide-5.png";
import homeGuide6 from "../../assets/images/homepage-walkthrough/Home-guide-6.png";

const HomePageWalkthroughModal = ({
  isOpen,
  onClose,
  onCreateNew,
  onImportClick,
  onExportClick,
  onSettingsClick,
  onSearchFocus,
  onSortClick,
  onClearStorage,
}) => {
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
      title: "Homepage Dashboard",
      icon: "fas fa-home",
      background: homeGuide1,
    },
    {
      id: "storage",
      title: "Storage Gauge",
      icon: "fas fa-database",
      background: homeGuide2,
    },
    {
      id: "diagrams",
      title: "Diagram Gallery",
      icon: "fas fa-th-large",
      background: homeGuide3,
    },
    {
      id: "bulk",
      title: "Bulk Operations",
      icon: "fas fa-layer-group",
      background: homeGuide4,
    },
    {
      id: "create",
      title: "Quick Create",
      icon: "fas fa-plus-circle",
      background: homeGuide5,
    },
    {
      id: "actions",
      title: "Toolbar Actions",
      icon: "fas fa-tools",
      background: homeGuide6,
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
                  "Your central command center for automata design. The homepage provides quick access to all your saved diagrams, creation tools, and management features in one organized interface."}
                {activeSection === 1 &&
                  "Track your browser storage usage with the live storage gauge. Monitor how much space your diagrams consume, view storage statistics, and clear all data when needed to free up space."}
                {activeSection === 2 &&
                  "Browse your diagram collection in an organized gallery view. Each card displays the diagram name, automata type (DFA/NFA/PDA), state count, and last modification timestamp for easy identification."}
                {activeSection === 3 &&
                  "Perform bulk operations on your diagram collection. Import multiple diagrams from backup files, export your entire collection as a single file, or manage large sets of automata diagrams efficiently."}
                {activeSection === 4 &&
                  "Start creating new automata diagrams instantly. Choose from different automata types (DFA, NFA, PDA, Turing Machine) and begin designing your finite state machines with a single click."}
                {activeSection === 5 &&
                  "Access essential toolbar functions and application settings. Use search and sort features, access help documentation, adjust preferences, and explore additional tools for enhanced productivity."}
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
