import React, { useState, useEffect } from "react";
import { useFSM } from "../../context/FSMContext.jsx";
import bmcLogo from "../../assets/images/bmc-logo.svg";
import SettingsModal from "../modals/SettingsModal";
import ImportJSONModal from "../modals/ImportJSONModal";
import ImportOptionsModal from "../modals/ImportOptionsModal";
import EditDiagramModal from "../modals/EditDiagramModal";
import NewDiagramModal from "../modals/NewDiagramModal";
import ExportModal from "../modals/ExportModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import HomePageWalkthroughModal from "../modals/HomePageWalkthroughModal";
import { Tooltip } from "react-tooltip";
import { SHORTCUTS } from "../../utils/shortcuts.js";
import indexedDBManager from "../../utils/IndexedDBUtils.js";

const HomePage = ({ onNavigateToApp }) => {
  const {
    getAllDiagrams,
    loadDiagram,
    setCurrentDiagramId,
    deleteDiagram,
    setDiagramName,
    setDiagramType,
    createNewDiagram,
    loadJSON,
    actions,
  } = useFSM();

  const { showConfirmation } = actions;
  const [diagrams, setDiagrams] = useState([]);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [importOptionsModalOpen, setImportOptionsModalOpen] = useState(false);
  const [importJSONModalOpen, setImportJSONModalOpen] = useState(false);
  const [importType, setImportType] = useState("diagram-json");
  const [newDiagramModalOpen, setNewDiagramModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [layoutView, setLayoutView] = useState("grid"); // "grid" or "list"
  const [coffeeModalOpen, setCoffeeModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("timestamp"); // "timestamp", "name", "states"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc", "desc"
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0 });
  const [clearStorageModalOpen, setClearStorageModalOpen] = useState(false);
  const [homePageWalkthroughOpen, setHomePageWalkthroughOpen] = useState(false);

  // Monitor storage usage
  useEffect(() => {
    const checkStorage = async () => {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageInfo({
            usage: estimate.usage || 0,
            quota: estimate.quota || 0,
          });
        } catch (error) {
          console.warn("Storage estimate failed:", error);
        }
      }
    };

    checkStorage();
    // Check storage every 30 seconds
    const interval = setInterval(checkStorage, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Clear all stored diagrams
  const handleClearStorage = () => {
    setClearStorageModalOpen(true);
  };

  const confirmClearStorage = async () => {
    try {
      const beforeEstimate = await navigator.storage.estimate();

      await indexedDBManager.clearAllDiagrams();
      setDiagrams([]);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const afterEstimate = await navigator.storage.estimate();

      setStorageInfo({
        usage: afterEstimate.usage || 0,
        quota: afterEstimate.quota || 0,
      });
      setClearStorageModalOpen(false);
    } catch (error) {
      console.error("Failed to clear diagrams:", error);
      setClearStorageModalOpen(false);
    }
  };

  // Handle creating first diagram from guide
  const handleCreateFirstDiagram = () => {
    setHomePageWalkthroughOpen(false);
    localStorage.setItem("homepage-walkthrough-shown", "true");
    setNewDiagramModalOpen(true);
  };

  // Load diagrams from IndexedDB
  useEffect(() => {
    const loadDiagrams = async () => {
      try {
        const diagramsData = await getAllDiagrams();
        setDiagrams(diagramsData);

        if (diagramsData.length === 0) {
          const hasSeenWalkthrough = localStorage.getItem(
            "homepage-walkthrough-shown"
          );
          if (!hasSeenWalkthrough) {
            setHomePageWalkthroughOpen(true);
          }
        }
      } catch (error) {
        console.error("Failed to load diagrams:", error);
      }
    };

    loadDiagrams();
  }, [getAllDiagrams]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const loadDiagrams = async () => {
          try {
            const diagramsData = await getAllDiagrams();
            setDiagrams(diagramsData);
          } catch (error) {
            console.error("Failed to refresh diagrams:", error);
          }
        };
        loadDiagrams();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [getAllDiagrams]);

  const handleCreateNew = () => {
    setNewDiagramModalOpen(true);
  };

  const handleSettingsClick = () => {
    setSettingsModalOpen(true);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        settingsModalOpen ||
        importJSONModalOpen ||
        newDiagramModalOpen ||
        editModalOpen ||
        exportModalOpen
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "n":
          case "N":
            if (e.shiftKey) {
              e.preventDefault();
              handleCreateNew();
            }
            break;
          case "1":
            e.preventDefault();
            setLayoutView("grid");
            break;
          case "2":
            e.preventDefault();
            setLayoutView("list");
            break;
          case ",":
            e.preventDefault();
            handleSettingsClick();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    settingsModalOpen,
    importJSONModalOpen,
    newDiagramModalOpen,
    editModalOpen,
    exportModalOpen,
    handleCreateNew,
    handleSettingsClick,
  ]);

  const formatLastUpdated = (timestamp) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Updated less than a minute ago";
    if (diffMins < 60)
      return `Updated ${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `Updated about ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `Updated ${Math.floor(diffHours / 24)} day${
      Math.floor(diffHours / 24) > 1 ? "s" : ""
    } ago`;
  };

  const handleCreateDiagram = (name, type) => {
    // Set the diagram name and type
    setDiagramName(name);
    setDiagramType(type);
    // Clear current diagram ID to ensure a new diagram is created
    setCurrentDiagramId(null);
    // Clear the canvas to start with a blank diagram
    createNewDiagram();
    onNavigateToApp();
  };

  const handleOpenDiagram = async (diagram) => {
    try {
      const success = await loadDiagram(diagram.id);
      if (success) {
        onNavigateToApp();
      }
    } catch (error) {
      console.error("Failed to load diagram:", error);
    }
  };

  const handleImportClick = () => {
    setImportOptionsModalOpen(true);
  };

  const handleImportOptionSelect = (option) => {
    setImportType(option);
    setImportOptionsModalOpen(false);
    setImportJSONModalOpen(true);
  };

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  const handleEditDiagram = (e, diagram) => {
    e.stopPropagation(); // Prevent opening the diagram
    setSelectedDiagram(diagram);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedDiagram(null);
  };

  const handleEditSave = async () => {
    // Refresh the diagrams list after editing
    try {
      const diagramsData = await getAllDiagrams();
      setDiagrams(diagramsData);
    } catch (error) {
      console.error("Failed to refresh diagrams:", error);
    }
  };

  const sortOptions = [
    { value: "timestamp", label: "Last Modified" },
    { value: "name", label: "Name" },
    { value: "states", label: "Number of States" },
  ];

  const handleSortOptionClick = (option) => {
    setSortBy(option);
    setSortDropdownOpen(false);
  };

  const handleCoffeeModalOpen = () => {
    setCoffeeModalOpen(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleDeleteDiagram = async (e, diagram) => {
    e.stopPropagation(); // Prevent opening the diagram
    showConfirmation({
      title: "Delete Diagram",
      message: `Are you sure you want to delete "${diagram.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteDiagram(diagram.id);
          // Refresh the diagrams list
          const diagramsData = await getAllDiagrams();
          setDiagrams(diagramsData);
        } catch (error) {
          console.error("Failed to delete diagram:", error);
        }
      },
    });
  };

  // Filter and sort diagrams
  const filteredAndSortedDiagrams = diagrams
    .filter(
      (diagram) =>
        diagram.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diagram.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let result;
      switch (sortBy) {
        case "name":
          result = a.name.localeCompare(b.name);
          break;
        case "states":
          const aStates = a.nodeCount || 0;
          const bStates = b.nodeCount || 0;
          result = aStates - bStates;
          break;
        case "timestamp":
        default:
          result = new Date(a.lastSaved) - new Date(b.lastSaved);
          break;
      }
      return sortOrder === "desc" ? -result : result;
    });

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-content-left">
            <div className="hero-icon">
              <i className="fas fa-compass-drafting"></i>
            </div>
            <h1 className="hero-title">
              Automata Drawing Tools
              <span className="hero-subtitle">
                by{" "}
                <a
                  href="https://www.phal-sovandy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-link"
                >
                  Phal Sovandy
                  <i className="fas fa-external-link-alt portfolio-icon"></i>
                </a>
              </span>
            </h1>
          </div>
          <p className="hero-description">
            Create and visualize finite state machines, automata, and
            computational models with our intuitive drag-and-drop editor. Design
            DFA, NFA, Turing machines, and more. Export your designs to various
            formats including PNG, SVG, and LaTeX. Get started by creating a new
            diagram.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon drawing-icon">
              <i className="fas fa-project-diagram"></i>
            </div>
            <h3 className="feature-title">Automata Drawing Tool</h3>
            <p className="feature-description">
              Create and visualize finite state machines, automata, and
              computational models with our intuitive drag-and-drop editor.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon data-icon">
              <i className="fas fa-database"></i>
            </div>
            <h3 className="feature-title">Data Stored Locally</h3>
            <p className="feature-description">
              All your diagrams and data are stored in your browser's local
              database, ensuring complete privacy and offline access.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon open-source-icon">
              <i className="fas fa-code-branch"></i>
            </div>
            <h3 className="feature-title">Free and Open Source</h3>
            <p className="feature-description">
              Completely free to use with no restrictions. Open source code
              available for transparency and community contributions.
            </p>
          </div>
        </div>
      </section>

      {/* Action Buttons Section */}
      <section className="action-buttons-section">
        <div className="action-buttons-grid">
          <a
            href="https://github.com/Phal-Sovandy/Automata-Drawing-Tool"
            target="_blank"
            rel="noopener noreferrer"
            className="action-button github-button"
          >
            <i className="fab fa-github"></i>
            <span>Git Repository</span>
          </a>

          <button
            className="action-button coffee-button"
            onClick={handleCoffeeModalOpen}
          >
            <i className="fas fa-coffee"></i>
            <span>Buy me Coffee</span>
          </button>

          <a
            href="https://youtube.com/playlist?list=PLxlNTqqJuQeAqTd9ItjbcjiXiIxb1ToVE&si=xEeaL8A0ZJGm_Ums"
            target="_blank"
            rel="noopener noreferrer"
            className="action-button resource-button"
          >
            <i className="fas fa-book"></i>
            <span>Resources</span>
          </a>

          <a
            href="https://github.com/Phal-Sovandy/Automata-Drawing-Tool/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="action-button report-button"
          >
            <i className="fas fa-bug"></i>
            <span>Report Bug</span>
          </a>
        </div>
      </section>

      {/* My Diagrams Section */}
      <section className="diagrams-section">
        <div className="diagrams-header">
          <h2 className="diagrams-title">My Diagrams</h2>
          <div className="storage-gauge-container">
            <span className="storage-label">Storage</span>
            <div className="storage-gauge">
              <div
                className="storage-gauge-fill"
                style={{
                  width: `${
                    storageInfo.quota > 0
                      ? (storageInfo.usage / storageInfo.quota) * 100
                      : 0
                  }%`,
                  backgroundColor: (() => {
                    if (storageInfo.quota === 0) return "#10b981";
                    const percentage =
                      (storageInfo.usage / storageInfo.quota) * 100;
                    if (percentage < 50) return "#10b981"; // Green
                    if (percentage < 85) return "#f59e0b"; // Orange
                    return "#ef4444"; // Red
                  })(),
                }}
              ></div>
            </div>
            <div className="storage-info">
              <span className="storage-used">
                {formatBytes(storageInfo.usage)}
              </span>
              <span className="storage-separator">/</span>
              <span className="storage-total">
                {formatBytes(storageInfo.quota)}
              </span>
            </div>
            <span className="storage-percentage">
              (
              {storageInfo.quota > 0
                ? ((storageInfo.usage / storageInfo.quota) * 100).toFixed(1)
                : 0}
              %)
            </span>
          </div>
          <button
            className="clear-storage-btn"
            onClick={handleClearStorage}
            title="Clear all stored diagrams"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
        <div className="diagrams-controls">
          {/* Primary Actions */}
          <div className="primary-actions">
            <button
              className="create-new-btn primary"
              onClick={handleCreateNew}
              data-tooltip-id="create-new-tooltip"
              data-tooltip-content={`Create New Diagram (${SHORTCUTS.CREATE_NEW})`}
            >
              <i className="fas fa-plus"></i>
              <span>Create New</span>
            </button>
            <button
              className="action-btn secondary"
              onClick={handleImportClick}
              data-tooltip-id="import-tooltip"
              data-tooltip-content="Import Diagram"
            >
              <i className="fas fa-upload"></i>
              <span>Import</span>
            </button>
          </div>

          {/* Search */}
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search diagrams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Sort */}
          <div className="sort-container">
            <div className="custom-dropdown">
              <div
                className="custom-dropdown-trigger"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                <span>
                  {sortOptions.find((opt) => opt.value === sortBy)?.label}
                </span>
                <span className="dropdown-arrow">
                  {sortDropdownOpen ? "⌃" : "⌄"}
                </span>
              </div>
              {sortDropdownOpen && (
                <div className="custom-dropdown-menu">
                  {sortOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`custom-dropdown-item ${
                        sortBy === option.value ? "selected" : ""
                      }`}
                      onClick={() => handleSortOptionClick(option.value)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className="sort-order-btn"
              onClick={toggleSortOrder}
              data-tooltip-id="sort-order-tooltip"
              data-tooltip-content={`Sort ${
                sortOrder === "asc" ? "Ascending" : "Descending"
              }`}
            >
              <i
                className={`fas fa-sort-amount-${
                  sortOrder === "asc" ? "up" : "down"
                }`}
              ></i>
            </button>
          </div>

          {/* View Toggle */}
          <div className="layout-toggle">
            <button
              className={`layout-btn ${layoutView === "grid" ? "active" : ""}`}
              onClick={() => setLayoutView("grid")}
              data-tooltip-id="grid-view-tooltip"
              data-tooltip-content={`Grid View (${SHORTCUTS.GRID_VIEW})`}
            >
              <i className="fas fa-th"></i>
            </button>
            <button
              className={`layout-btn ${layoutView === "list" ? "active" : ""}`}
              onClick={() => setLayoutView("list")}
              data-tooltip-id="list-view-tooltip"
              data-tooltip-content={`List View (${SHORTCUTS.LIST_VIEW})`}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="secondary-actions">
            <button
              className="action-btn"
              onClick={handleExportClick}
              data-tooltip-id="export-tooltip"
              data-tooltip-content="Export Diagram"
            >
              <i className="fas fa-download"></i>
            </button>
            <button
              className="action-btn"
              onClick={handleSettingsClick}
              data-tooltip-id="settings-tooltip"
              data-tooltip-content={`Preferences (${SHORTCUTS.PREFERENCES})`}
            >
              <i className="fas fa-cog"></i>
            </button>
            <button
              className="action-btn"
              onClick={() => setHomePageWalkthroughOpen(true)}
              data-tooltip-id="walkthrough-tooltip"
              data-tooltip-content="Help"
            >
              <i className="fas fa-question-circle"></i>
            </button>
          </div>
        </div>

        <div className={`diagrams-container ${layoutView}`}>
          {filteredAndSortedDiagrams.length > 0 ? (
            filteredAndSortedDiagrams.map((diagram, index) => (
              <div
                key={diagram.id}
                className={`diagram-card ${index === 0 ? "active" : ""}`}
                onClick={() => handleOpenDiagram(diagram)}
                style={{ "--accent-color": diagram.accentColor || "#36454f" }}
              >
                {/* Action buttons - appear on hover */}
                <div className="diagram-actions">
                  <button
                    className="diagram-action-btn edit-btn"
                    onClick={(e) => handleEditDiagram(e, diagram)}
                    data-tooltip-id="edit-diagram-tooltip"
                    data-tooltip-content="Edit Diagram"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="diagram-action-btn delete-btn"
                    onClick={(e) => handleDeleteDiagram(e, diagram)}
                    data-tooltip-id="delete-diagram-tooltip"
                    data-tooltip-content="Delete Diagram"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                <div className="diagram-header">
                  <h3 className="diagram-name">
                    {diagram.name || "Untitled Diagram"}
                  </h3>
                  <div className="diagram-type">
                    <i className="fas fa-database"></i>
                    <span>{diagram.type}</span>
                  </div>
                </div>
                <div className="diagram-stats">
                  <div className="stat">
                    <i className="fas fa-circle"></i>
                    <span>{diagram.nodeCount} States</span>
                  </div>
                  <div className="stat">
                    <i className="fas fa-arrow-right"></i>
                    <span>{diagram.linkCount} Transitions</span>
                  </div>
                </div>
                <div className="diagram-footer">
                  <span className="last-updated">
                    {formatLastUpdated(diagram.lastSaved)}
                  </span>
                </div>
              </div>
            ))
          ) : searchTerm ? (
            <div className="empty-state">
              <i className="fas fa-search"></i>
              <h3>No diagrams found</h3>
              <p>No diagrams match your search term "{searchTerm}"</p>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-otter"></i>
              <h3>No diagrams yet</h3>
              <p>Create your first automata diagram to get started</p>
              <button className="create-first-btn" onClick={handleCreateNew}>
                <i className="fas fa-paint-brush"></i>
                Create Your First Diagram
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
      <ImportOptionsModal
        isOpen={importOptionsModalOpen}
        onClose={() => setImportOptionsModalOpen(false)}
        onSelectOption={handleImportOptionSelect}
      />
      <ImportJSONModal
        isOpen={importJSONModalOpen}
        onClose={() => setImportJSONModalOpen(false)}
        importType={importType}
        defaultName=""
        defaultType="DFA"
        onImport={(canvasData, diagramName) => {
          showConfirmation({
            title: "Import JSON as New Diagram",
            message: `This will create a new diagram named "${diagramName}" with the imported data. Continue?`,
            confirmText: "Create Diagram",
            cancelText: "Cancel",
            type: "info",
            onConfirm: () => {
              // Create new diagram and load the JSON data
              createNewDiagram();
              // Load the JSON data into the new diagram
              loadJSON(canvasData);
              // Navigate to the canvas
              onNavigateToApp();
            },
          });
        }}
      />
      <EditDiagramModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        diagram={selectedDiagram}
        onSave={handleEditSave}
      />
      <NewDiagramModal
        isOpen={newDiagramModalOpen}
        onClose={() => setNewDiagramModalOpen(false)}
        onCreate={handleCreateDiagram}
      />
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
      <ConfirmationModal
        isOpen={clearStorageModalOpen}
        onClose={() => setClearStorageModalOpen(false)}
        onConfirm={confirmClearStorage}
        title="Clear All Diagrams"
        message="Are you sure you want to clear all stored diagrams? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        type="danger"
      />
      <HomePageWalkthroughModal
        isOpen={homePageWalkthroughOpen}
        onClose={() => {
          setHomePageWalkthroughOpen(false);
          localStorage.setItem("homepage-walkthrough-shown", "true");
        }}
        onCreateNew={handleCreateNew}
        onImportClick={handleImportClick}
        onExportClick={handleExportClick}
        onSettingsClick={handleSettingsClick}
        onSearchFocus={() => {
          const searchInput = document.querySelector(".search-input");
          if (searchInput) {
            searchInput.focus();
          }
        }}
        onSortClick={() => {
          const sortDropdown = document.querySelector(
            ".custom-dropdown-trigger"
          );
          if (sortDropdown) {
            sortDropdown.click();
          }
        }}
        onClearStorage={handleClearStorage}
      />

      {/* Tooltip components */}
      <Tooltip
        id="sort-order-tooltip"
        place="top"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="grid-view-tooltip"
        place="top"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="list-view-tooltip"
        place="top"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="settings-tooltip"
        place="top"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="export-tooltip"
        place="top"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="import-tooltip"
        place="top"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="walkthrough-tooltip"
        place="top"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="create-new-tooltip"
        place="top"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="edit-diagram-tooltip"
        place="top"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="delete-diagram-tooltip"
        place="top"
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />

      {/* Coffee Support Modal */}
      {coffeeModalOpen && (
        <div
          className="modal-overlay support-modal"
          onClick={() => setCoffeeModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Support Options</h2>
              <p className="modal-subtitle">
                Choose your preferred way to support the development of this
                tool
              </p>
              <button
                className="modal-close"
                onClick={() => setCoffeeModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="support-options">
                {/* BuyMeACoffee Option */}
                <div
                  className="support-option"
                  onClick={() => {
                    window.open(
                      "https://buymeacoffee.com/phalsovandy",
                      "_blank"
                    );
                    setCoffeeModalOpen(false);
                  }}
                >
                  <div className="support-option-header">
                    <div className="support-option-icon">
                      <img
                        src={bmcLogo}
                        alt="BuyMeACoffee"
                        className="bmc-logo"
                      />
                    </div>
                    <h3 className="support-option-title">BuyMeACoffee</h3>
                  </div>
                  <p className="support-option-description">
                    Support with a coffee through our international platform.
                    Quick and easy payment with credit card or PayPal.
                  </p>
                </div>

                {/* ABA Bank Option */}
                <div
                  className="support-option"
                  onClick={() => {
                    window.open(
                      "https://pay.ababank.com/oRF8/dwujr1pk",
                      "_blank"
                    );
                    setCoffeeModalOpen(false);
                  }}
                >
                  <div className="support-option-header">
                    <div className="support-option-icon">
                      <i className="fas fa-university"></i>
                    </div>
                    <h3 className="support-option-title">
                      ABA<span className="red-apostrophe">'</span> Bank
                    </h3>
                  </div>
                  <p className="support-option-description">
                    Direct bank transfer using ABA Bank. Account holder: PHAL
                    SOVANDY, Account number: 005 660 975.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
