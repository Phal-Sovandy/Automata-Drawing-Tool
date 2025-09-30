import React, { useState, useEffect } from "react";
import Dropdown from "../ui/Dropdown";
import AboutModal from "../modals/AboutModal";
import ShortcutsModal from "../modals/ShortcutsModal";
import SpecialCharactersModal from "../modals/SpecialCharactersModal";
import SettingsModal from "../modals/SettingsModal";
import ImportJSONModal from "../modals/ImportJSONModal";
import ColorPicker from "../ui/ColorPicker";
import { Tooltip } from "react-tooltip";
import { useFSM } from "../../context/FSMContext.jsx";
import {
  SelfLink,
  StartLink,
  StandaloneArrow,
} from "../../utils/FSMClasses.jsx";
import { SHORTCUTS } from "../../utils/shortcuts.js";

const TopNavigation = ({ onNavigateToHome }) => {
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [specialCharactersModalOpen, setSpecialCharactersModalOpen] =
    useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [importJSONModalOpen, setImportJSONModalOpen] = useState(false);
  const [importType, setImportType] = useState("diagram-json");

  // Add guard to ensure context is available
  const fsmContext = useFSM();
  if (!fsmContext) {
    return null; // Don't render until context is available
  }

  const {
    exportPNG,
    exportHighResPNG,
    exportSVG,
    exportLaTeX,
    clearAll,
    saveHistory,
    nodes,
    isSidebarCollapsed,
    toggleSidebar,
    links,
    loadJSON,
    saveCanvasToIndexedDB,
    diagramName,
    diagramType,
    savingStatus,
    actions,
  } = fsmContext;

  const { showConfirmation } = actions;

  // Get saving status display
  const getSavingStatusDisplay = () => {
    switch (savingStatus) {
      case "saving":
        return {
          text: "Saving...",
          className: "nav-saving-status saving",
          icon: "fas fa-spinner fa-spin",
        };
      case "saved":
        return {
          text: "Saved",
          className: "nav-saving-status saved",
          icon: "fas fa-check",
        };
      case "error":
        return {
          text: "Failed to Save",
          className: "nav-saving-status error",
          icon: "fas fa-exclamation-triangle",
        };
      case "idle":
      default:
        return {
          text: "Ready",
          className: "nav-saving-status idle",
          icon: "fas fa-circle",
        };
    }
  };

  const handleExportPNG = () => {
    exportPNG();
  };

  const handleExportHighResPNG = () => {
    exportHighResPNG();
  };

  const handleExportSVG = () => {
    exportSVG();
  };

  const handleExportLaTeX = () => {
    try {
      exportLaTeX();
    } catch (error) {
      console.error("LaTeX Export - Error in click handler:", error);
      alert("Error exporting LaTeX: " + error.message);
    }
  };

  const handleAboutClick = () => {
    setAboutModalOpen(true);
  };

  const handleShortcutsClick = () => {
    setShortcutsModalOpen(true);
  };

  const handleSpecialCharactersClick = () => {
    setSpecialCharactersModalOpen(true);
  };

  const handleSettingsClick = () => {
    setSettingsModalOpen(true);
  };

  const handleClearAll = async () => {
    showConfirmation({
      title: "Clear All",
      message:
        "Are you sure you want to clear all states, transitions, and history? This action cannot be undone.",
      confirmText: "Clear All",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        await clearAll();
      },
    });
  };

  const handleSaveJSON = () => {
    try {
      const canvasData = {
        nodes: nodes.map((node) => ({
          id: node.id,
          x: node.x,
          y: node.y,
          text: node.text,
          isAcceptState: node.isAcceptState,
          radius: node.radius,
          color: node.color,
          textColor: node.textColor,
        })),
        links: links.map((link) => {
          const baseData = {
            id: link.id,
            text: link.text,
            color: link.color,
            textColor: link.textColor,
          };

          if (link instanceof SelfLink) {
            return {
              ...baseData,
              type: "SelfLink",
              node: link.node
                ? { id: link.node.id, x: link.node.x, y: link.node.y }
                : null,
              anchorAngle: link.anchorAngle,
              loopRadius: link.loopRadius,
            };
          } else if (link instanceof StartLink) {
            return {
              ...baseData,
              type: "StartLink",
              node: link.node
                ? { id: link.node.id, x: link.node.x, y: link.node.y }
                : null,
              deltaX: link.deltaX,
              deltaY: link.deltaY,
            };
          } else if (link instanceof StandaloneArrow) {
            return {
              ...baseData,
              type: "StandaloneArrow",
              startX: link.startX,
              startY: link.startY,
              endX: link.endX,
              endY: link.endY,
              lineAngleAdjust: link.lineAngleAdjust,
              parallelPart: link.parallelPart,
              perpendicularPart: link.perpendicularPart,
            };
          } else {
            // Regular Link
            return {
              ...baseData,
              type: "Link",
              nodeA: link.nodeA
                ? { id: link.nodeA.id, x: link.nodeA.x, y: link.nodeA.y }
                : null,
              nodeB: link.nodeB
                ? { id: link.nodeB.id, x: link.nodeB.x, y: link.nodeB.y }
                : null,
              lineAngleAdjust: link.lineAngleAdjust,
              parallelPart: link.parallelPart,
              perpendicularPart: link.perpendicularPart,
            };
          }
        }),
        timestamp: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(canvasData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `fsm-canvas-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving JSON:", error);
      alert("Error saving JSON file: " + error.message);
    }
  };

  const handleImportJSON = () => {
    // In canvas page, go directly to JSON import (single diagram only)
    setImportType("diagram-json");
    setImportJSONModalOpen(true);
  };

  const handleImportFromModal = (canvasData, diagramName) => {
    showConfirmation({
      title: "Import JSON",
      message:
        "Importing JSON will replace the current diagram's canvas data with the data from the JSON file. The diagram name and type will be preserved, but all canvas content and history will be lost. This action cannot be undone. Are you sure you want to continue?",
      confirmText: "Replace Diagram",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: async () => {
        // Load the JSON data using the context function
        loadJSON(canvasData);
        // The auto-save will handle saving the imported data to the current diagram
        // No need to manually call saveCanvasToIndexedDB as it might create a new diagram
      },
    });
  };

  const handleNavigateToHome = async () => {
    try {
      // Save current diagram to IndexedDB before navigating
      await saveCanvasToIndexedDB();

      // Clear session storage (undo/redo history) when going back to home
      try {
        sessionStorage.removeItem("fsm-history");
        sessionStorage.removeItem("fsm-history-index");
      } catch (error) {
        console.warn("Failed to clear session storage:", error);
      }

      onNavigateToHome();
    } catch (error) {
      console.error("Failed to save diagram before navigating:", error);
      // Still navigate even if save fails
      onNavigateToHome();
    }
  };

  // Listen for keyboard shortcut events
  useEffect(() => {
    const handleSaveJSONEvent = () => {
      handleSaveJSON();
    };

    const handleImportJSONEvent = () => {
      handleImportJSON();
    };

    const handleOpenSettingsEvent = () => {
      handleSettingsClick();
    };

    const handleOpenShortcutsEvent = () => {
      handleShortcutsClick();
    };

    const handleOpenSpecialCharsEvent = () => {
      handleSpecialCharactersClick();
    };

    window.addEventListener("saveJSON", handleSaveJSONEvent);
    window.addEventListener("importJSON", handleImportJSONEvent);
    window.addEventListener("openSettings", handleOpenSettingsEvent);
    window.addEventListener("openShortcuts", handleOpenShortcutsEvent);
    window.addEventListener("openSpecialChars", handleOpenSpecialCharsEvent);

    return () => {
      window.removeEventListener("saveJSON", handleSaveJSONEvent);
      window.removeEventListener("importJSON", handleImportJSONEvent);
      window.removeEventListener("openSettings", handleOpenSettingsEvent);
      window.removeEventListener("openShortcuts", handleOpenShortcutsEvent);
      window.removeEventListener(
        "openSpecialChars",
        handleOpenSpecialCharsEvent
      );
    };
  }, []);

  return (
    <>
      <nav className="top-nav">
        <div className="nav-content">
          <div className="nav-menu">
            <button
              className="nav-item nav-home-btn"
              onClick={handleNavigateToHome}
              data-tooltip-id="home-tooltip"
              data-tooltip-content={`Home (${SHORTCUTS.HOME})`}
            >
              <i className="fas fa-home"></i>
            </button>
            <Dropdown
              trigger={<span className="nav-item">File</span>}
              className="nav-dropdown"
            >
              <div className="dropdown-item" onClick={handleSaveJSON}>
                Save JSON{" "}
                <span className="shortcut">{SHORTCUTS.SAVE_JSON}</span>
              </div>
              <div className="dropdown-item" onClick={handleImportJSON}>
                Import JSON{" "}
                <span className="shortcut">{SHORTCUTS.IMPORT_JSON}</span>
              </div>
              <div className="dropdown-separator"></div>
              <Dropdown
                trigger={
                  <div className="dropdown-item">
                    Export As{" "}
                    <span style={{ float: "right", color: "#9ca3af" }}>›</span>
                  </div>
                }
                className="dropdown-submenu"
              >
                <div className="dropdown-item" onClick={handleExportPNG}>
                  Export as PNG
                </div>
                <div className="dropdown-item" onClick={handleExportHighResPNG}>
                  Export as High-Res PNG
                </div>
                <div className="dropdown-item" onClick={handleExportSVG}>
                  Export as SVG
                </div>
                <div className="dropdown-item" onClick={handleExportLaTeX}>
                  Export as LaTeX
                </div>
              </Dropdown>
              <div className="dropdown-separator"></div>
              <div
                className="dropdown-item dropdown-item-danger"
                onClick={handleClearAll}
              >
                Clear All
              </div>
            </Dropdown>

            <span
              className="nav-item"
              onClick={handleSettingsClick}
              style={{ cursor: "pointer" }}
              data-tooltip-id="settings-tooltip"
              data-tooltip-content={`Preferences (${SHORTCUTS.PREFERENCES})`}
            >
              Preferences
            </span>

            <Dropdown
              trigger={<span className="nav-item">Help</span>}
              className="nav-dropdown"
            >
              <div className="dropdown-item" onClick={handleAboutClick}>
                About
              </div>
              <div className="dropdown-item" onClick={handleShortcutsClick}>
                View Shortcuts{" "}
                <span className="shortcut">{SHORTCUTS.SHORTCUTS}</span>
              </div>
              <div
                className="dropdown-item"
                onClick={handleSpecialCharactersClick}
              >
                View Special Characters{" "}
                <span className="shortcut">{SHORTCUTS.SPECIAL_CHARS}</span>
              </div>
            </Dropdown>
          </div>

          {/* Saving Status */}
          {(() => {
            const statusDisplay = getSavingStatusDisplay();

            return (
              <div className={statusDisplay.className}>
                <i className={statusDisplay.icon}></i>
                <span className="saving-text">{statusDisplay.text}</span>
              </div>
            );
          })()}
        </div>
      </nav>

      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
      <SpecialCharactersModal
        isOpen={specialCharactersModalOpen}
        onClose={() => setSpecialCharactersModalOpen(false)}
      />
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
      <ImportJSONModal
        isOpen={importJSONModalOpen}
        onClose={() => setImportJSONModalOpen(false)}
        importType={importType}
        onImport={handleImportFromModal}
        replaceMode={true}
      />

      {/* Tooltip component */}
      <Tooltip
        id="home-tooltip"
        place="bottom"
        offset={5}
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
          zIndex: 9999,
        }}
      />
      <Tooltip
        id="settings-tooltip"
        place="bottom"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
          zIndex: 9999,
        }}
      />
    </>
  );
};

export default TopNavigation;
