import React, { useState, useEffect, useRef } from "react";
import { useFSM } from "../../context/FSMContext.jsx";
import { convertLatexShortcuts } from "../../utils/FSMClasses.jsx";
import { Tooltip } from "react-tooltip";
import { SHORTCUTS } from "../../utils/shortcuts.js";

const Sidebar = () => {
  const {
    nodes,
    links,
    selectedObject,
    selectObject,
    nodeRadius,
    clearAllNodes,
    clearAllLinks,
    setNodeRadius,
    saveHistory,
    undo,
    redo,
    history,
    historyIndex,
    diagramName,
    diagramType,
    setDiagramName,
    setDiagramType,
    isSidebarCollapsed,
    toggleSidebar,
    theme,
    actions,
  } = useFSM();

  const { showConfirmation } = actions;
  const [activeTab, setActiveTab] = useState("states");
  const [filterValue, setFilterValue] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);
  const [tempName, setTempName] = useState(diagramName || "");
  const [tempType, setTempType] = useState(diagramType);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const diagramTypes = [
    { value: "DFA", label: "DFA (Deterministic Finite Automaton)" },
    { value: "NFA", label: "NFA (Non-deterministic Finite Automaton)" },
    { value: "PDA", label: "PDA (Pushdown Automaton)" },
    { value: "Turing Machine", label: "Turing Machine" },
    { value: "Other", label: "Other" },
  ];

  const handleTabClick = (tabType) => {
    setActiveTab(tabType);
    setFilterValue(""); // Clear filter when switching tabs
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setTempName(diagramName || "");
  };

  const handleNameSave = () => {
    const trimmedName = tempName.trim();

    if (!trimmedName) {
      showConfirmation({
        title: "Invalid Name",
        message: "Please enter a diagram name.",
        confirmText: "OK",
        cancelText: "",
        type: "warning",
      });
      return;
    }

    setDiagramName(trimmedName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(diagramName || "");
    setIsEditingName(false);
  };

  const handleTypeEdit = () => {
    setIsEditingType(true);
    setTempType(diagramType);
  };

  const handleTypeSave = () => {
    setDiagramType(tempType);
    setIsEditingType(false);
  };

  const handleTypeCancel = () => {
    setTempType(diagramType);
    setIsEditingType(false);
  };

  const handleDropdownSelect = (value) => {
    setTempType(value);
    setDiagramType(value);
    setIsEditingType(false);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsEditingType(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (item) => {
    selectObject(item);
  };

  const handleClearAllStates = () => {
    showConfirmation({
      title: "Clear All States",
      message: "Are you sure you want to clear all states and transitions?",
      confirmText: "Clear All",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: () => {
        saveHistory();
        clearAllNodes();
      },
    });
  };

  const handleClearAllTransitions = () => {
    showConfirmation({
      title: "Clear All Transitions",
      message: "Are you sure you want to clear all transitions?",
      confirmText: "Clear All",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: () => {
        saveHistory();
        clearAllLinks();
      },
    });
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const filteredNodes = nodes.filter((node) => {
    if (!filterValue) return true;
    const nodeText = node.text || `State ${nodes.indexOf(node) + 1}`;
    return nodeText.toLowerCase().includes(filterValue.toLowerCase());
  });

  const filteredLinks = links.filter((link) => {
    if (!filterValue) return true;
    const linkText = link.text || `Transition ${links.indexOf(link) + 1}`;
    return linkText.toLowerCase().includes(filterValue.toLowerCase());
  });

  const renderStatesList = () => {
    if (filteredNodes.length === 0) {
      return (
        <div className="empty-state">
          <p>No states in this diagram yet.</p>
        </div>
      );
    }

    return filteredNodes.map((node, index) => {
      // Check if this is a reject state (no outgoing transitions except self-transitions)
      const hasOutgoingTransitions = links.some((link) => {
        // Check if this node is the source of any transition
        if (link.nodeA === node) {
          // If it's a self-link, we still consider it as having an outgoing transition
          // But if it's a regular link to another node, it's definitely not a reject state
          return true;
        }
        return false;
      });

      const isRejectState = !hasOutgoingTransitions && !node.isAcceptState;
      const stateType = node.isAcceptState
        ? "Accept State"
        : isRejectState
        ? "Reject State"
        : "State";
      const stateText = node.text || `State ${nodes.indexOf(node) + 1}`;
      const isSelected = selectedObject === node;

      return (
        <div
          key={index}
          className={`list-item ${isSelected ? "selected" : ""} ${
            node.isAcceptState ? "final-state" : ""
          } ${isRejectState ? "reject-state" : ""}`}
          onClick={() => handleItemClick(node)}
        >
          <div
            className={`item-icon state ${
              node.isAcceptState ? "final-state-icon" : ""
            } ${isRejectState ? "reject-state-icon" : ""}`}
          >
            {node.isAcceptState ? "A" : isRejectState ? "R" : "S"}
          </div>
          <div className="item-content">
            <div className="item-name">{convertLatexShortcuts(stateText)}</div>
            <div className="item-details">
              {stateType} at ({Math.round(node.x)}, {Math.round(node.y)})
            </div>
          </div>
        </div>
      );
    });
  };

  const renderTransitionsList = () => {
    if (filteredLinks.length === 0) {
      return (
        <div className="empty-state">
          <p>No transitions in this diagram yet.</p>
        </div>
      );
    }

    return filteredLinks.map((link, index) => {
      const transitionText =
        link.text || `Transition ${links.indexOf(link) + 1}`;
      let transitionDetails = "";
      const isSelected = selectedObject === link;

      if (link.nodeA && link.nodeB) {
        // Regular link between two nodes
        const fromText = link.nodeA.text || "State A";
        const toText = link.nodeB.text || "State B";
        transitionDetails = `From "${fromText}" to "${toText}"`;
      } else if (link.node) {
        // Self-link or start link
        const nodeText = link.node.text || "State";
        if (link.anchorAngle !== undefined) {
          transitionDetails = `Self-transition from "${nodeText}"`;
        } else {
          transitionDetails = `Start link to "${nodeText}"`;
        }
      }

      // Determine icon based on link type
      let iconText = "T"; // Default for regular transitions
      if (link.anchorAngle !== undefined) {
        iconText = "L"; // Self-link
      } else if (link.deltaX !== undefined && link.deltaY !== undefined) {
        iconText = "S"; // Start link
      }

      return (
        <div
          key={index}
          className={`list-item ${isSelected ? "selected" : ""}`}
          onClick={() => handleItemClick(link)}
        >
          <div className="item-icon transition">{iconText}</div>
          <div className="item-content">
            <div className="item-name">
              {convertLatexShortcuts(transitionText)}
            </div>
            <div className="item-details">{transitionDetails}</div>
          </div>
        </div>
      );
    });
  };

  return (
    <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <div
        className="sidebar-toggle"
        onClick={toggleSidebar}
        data-tooltip-id="sidebar-toggle-tooltip"
        data-tooltip-content={
          isSidebarCollapsed
            ? `Show Sidebar (${SHORTCUTS.TOGGLE_SIDEBAR})`
            : `Hide Sidebar (${SHORTCUTS.TOGGLE_SIDEBAR})`
        }
      >
        <span className="toggle-icon">{isSidebarCollapsed ? "▶" : "◀"}</span>
      </div>

      {isSidebarCollapsed ? (
        <div className="sidebar-collapsed-content">
          <button
            className="expand-sidebar-btn"
            onClick={toggleSidebar}
            data-tooltip-id="expand-sidebar-tooltip"
            data-tooltip-content={`Show Sidebar (${SHORTCUTS.TOGGLE_SIDEBAR})`}
          >
            <span className="expand-icon">☰</span>
          </button>
        </div>
      ) : (
        <>
          <div className="project-info">
            <div className="project-name-container">
              {isEditingName ? (
                <div className="edit-container">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => {
                      if (e.target.value.length <= 50) {
                        setTempName(e.target.value);
                      }
                    }}
                    className="edit-input"
                    maxLength={50}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleNameSave();
                      if (e.key === "Escape") handleNameCancel();
                    }}
                    onBlur={handleNameSave}
                  />
                  <span className="character-count">{tempName.length}/50</span>
                </div>
              ) : (
                <div className="project-name-display" onClick={handleNameEdit}>
                  <h2 className="project-name">
                    {diagramName || "Untitled Diagram"}
                  </h2>
                  <span className="edit-icon">✎</span>
                </div>
              )}
            </div>

            <div className="project-type-container">
              {isEditingType ? (
                <div className="edit-container">
                  <div className="custom-dropdown" ref={dropdownRef}>
                    <div
                      className="custom-dropdown-trigger"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span>
                        {
                          diagramTypes.find((type) => type.value === tempType)
                            ?.label
                        }
                      </span>
                      <span className="dropdown-arrow">
                        {isDropdownOpen ? "⌃" : "⌄"}
                      </span>
                    </div>
                    {isDropdownOpen && (
                      <div className="custom-dropdown-menu">
                        {diagramTypes.map((type) => (
                          <div
                            key={type.value}
                            className={`custom-dropdown-item ${
                              tempType === type.value ? "selected" : ""
                            }`}
                            onClick={() => handleDropdownSelect(type.value)}
                          >
                            {type.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="project-type-display" onClick={handleTypeEdit}>
                  <p className="project-type">
                    {diagramTypes.find((type) => type.value === diagramType)
                      ?.label || diagramType}
                  </p>
                  <span className="dropdown-icon">⌄</span>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-tabs">
            <div
              className={`tab ${activeTab === "states" ? "active" : ""}`}
              onClick={() => handleTabClick("states")}
            >
              <span className="tab-icon">S</span>
              <span className="tab-text">States ({nodes.length})</span>
            </div>
            <div
              className={`tab ${activeTab === "transitions" ? "active" : ""}`}
              onClick={() => handleTabClick("transitions")}
            >
              <span className="tab-icon">T</span>
              <span className="tab-text">Transitions ({links.length})</span>
            </div>
          </div>

          <div className="filter-section">
            <input
              type="text"
              placeholder={
                activeTab === "states"
                  ? "Filter states..."
                  : "Filter transitions..."
              }
              className="filter-input"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </div>

          <div className="clear-all-section">
            <div className="action-buttons">
              <button
                className="action-btn action-btn--undo"
                onClick={undo}
                disabled={!canUndo}
                data-tooltip-id="undo-tooltip"
                data-tooltip-content={`Undo (${SHORTCUTS.UNDO})`}
              >
                ↶ Undo
              </button>
              <button
                className="action-btn action-btn--redo"
                onClick={redo}
                disabled={!canRedo}
                data-tooltip-id="redo-tooltip"
                data-tooltip-content={`Redo (${SHORTCUTS.REDO})`}
              >
                ↷ Redo
              </button>
            </div>
            {activeTab === "states" && nodes.length > 0 && (
              <button
                className="clear-all-btn clear-all-btn--states"
                onClick={handleClearAllStates}
              >
                Clear All States
              </button>
            )}
            {activeTab === "transitions" && links.length > 0 && (
              <button
                className="clear-all-btn clear-all-btn--transitions"
                onClick={handleClearAllTransitions}
              >
                Clear All Transitions
              </button>
            )}
          </div>

          <div className="radius-control-section">
            <div className="radius-control-header">
              <span className="radius-label">State Radius</span>
              <span className="radius-value">{nodeRadius}px</span>
            </div>
            <div className="radius-slider-container">
              <input
                type="range"
                min="10"
                max="50"
                value={nodeRadius}
                onChange={(e) => setNodeRadius(parseInt(e.target.value))}
                className="custom-range-slider"
              />
            </div>
          </div>

          <div className="content-area">
            {activeTab === "states" ? (
              <div className="states-list">{renderStatesList()}</div>
            ) : (
              <div className="transitions-list">{renderTransitionsList()}</div>
            )}
          </div>
        </>
      )}

      {/* Tooltip components */}
      <Tooltip
        id="sidebar-toggle-tooltip"
        place="right"
        style={{
          backgroundColor: theme === "dark" ? "#111827" : "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="expand-sidebar-tooltip"
        place="right"
        style={{
          backgroundColor: theme === "dark" ? "#111827" : "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="undo-tooltip"
        place="top"
        style={{
          backgroundColor: theme === "dark" ? "#111827" : "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="redo-tooltip"
        place="top"
        style={{
          backgroundColor: theme === "dark" ? "#111827" : "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
    </aside>
  );
};

export default Sidebar;
