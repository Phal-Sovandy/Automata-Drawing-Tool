import React, { useState, useRef, useEffect } from "react";
import { useFSM } from "../../context/FSMContext";

const ImportJSONModal = ({
  isOpen,
  onClose,
  onImport,
  replaceMode = false,
  importType = "diagram-json", // "diagram-json" or "automata-json"
  defaultName = null, // Override default name
  defaultType = null, // Override default type
}) => {
  const {
    diagramName,
    diagramType,
    setDiagramName,
    setDiagramType,
    setCurrentDiagramId,
    importAutomataJSON,
  } = useFSM();
  const [localDiagramName, setLocalDiagramName] = useState(
    defaultName !== null ? defaultName : diagramName
  );
  const [localDiagramType, setLocalDiagramType] = useState(
    defaultType !== null ? defaultType : diagramType
  );
  const [jsonContent, setJsonContent] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const diagramTypes = [
    { value: "DFA", label: "DFA (Deterministic Finite Automaton)" },
    { value: "NFA", label: "NFA (Non-deterministic Finite Automaton)" },
    { value: "PDA", label: "PDA (Pushdown Automaton)" },
    { value: "Turing Machine", label: "Turing Machine" },
    { value: "Other", label: "Other" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      if (isDropdownOpen) {
        calculateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isDropdownOpen) {
        calculateDropdownPosition();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDropdownOpen]);

  // Sync local state with context state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalDiagramName(defaultName !== null ? defaultName : diagramName);
      setLocalDiagramType(defaultType !== null ? defaultType : diagramType);
      setError(""); // Clear any previous errors
      setJsonContent(""); // Clear previous content
    }
  }, [isOpen, diagramName, diagramType, defaultName, defaultType]);

  const validateAndSetJsonContent = (content) => {
    setError(""); // Clear any previous errors

    if (!content.trim()) {
      setError("Please provide JSON content or upload a file.");
      return false;
    }

    try {
      const parsed = JSON.parse(content);

      // Basic validation for JSON structure
      if (typeof parsed !== "object" || parsed === null) {
        setError("Invalid JSON: Expected an object.");
        return false;
      }

      // Check if it's an .automata-json file (complete backup)
      if (importType === "automata-json") {
        if (
          !parsed.version ||
          !parsed.diagrams ||
          !Array.isArray(parsed.diagrams)
        ) {
          setError(
            "Invalid .automata-json format: Expected 'version' and 'diagrams' array."
          );
          return false;
        }

        // Validate each diagram in the backup
        for (let i = 0; i < parsed.diagrams.length; i++) {
          const diagram = parsed.diagrams[i];
          if (
            !diagram.nodes ||
            !Array.isArray(diagram.nodes) ||
            !diagram.links ||
            !Array.isArray(diagram.links)
          ) {
            setError(
              `Invalid diagram at index ${i}: Missing or invalid 'nodes' or 'links' array.`
            );
            return false;
          }
        }
      } else {
        // Check if it has the expected structure for single diagram (nodes and links)
        if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
          setError("Invalid FSM data: Missing or invalid 'nodes' array.");
          return false;
        }

        if (!parsed.links || !Array.isArray(parsed.links)) {
          setError("Invalid FSM data: Missing or invalid 'links' array.");
          return false;
        }
      }

      // For single diagram JSON, validate the structure
      if (importType === "diagram-json") {
        // Validate nodes structure
        for (let i = 0; i < parsed.nodes.length; i++) {
          const node = parsed.nodes[i];
          if (typeof node !== "object" || node === null) {
            setError(`Invalid node at index ${i}: Expected an object.`);
            return false;
          }

          // Check required properties for nodes
          if (typeof node.x !== "number" || typeof node.y !== "number") {
            setError(
              `Invalid node at index ${i}: Missing or invalid 'x' and 'y' coordinates.`
            );
            return false;
          }

          if (node.id === undefined || node.id === null) {
            setError(`Invalid node at index ${i}: Missing 'id' property.`);
            return false;
          }

          // Check optional properties have correct types
          if (node.text !== undefined && typeof node.text !== "string") {
            setError(
              `Invalid node at index ${i}: 'text' property must be a string.`
            );
            return false;
          }

          if (
            node.isAcceptState !== undefined &&
            typeof node.isAcceptState !== "boolean"
          ) {
            setError(
              `Invalid node at index ${i}: 'isAcceptState' property must be a boolean.`
            );
            return false;
          }
        }

        // Validate links structure
        for (let i = 0; i < parsed.links.length; i++) {
          const link = parsed.links[i];
          if (typeof link !== "object" || link === null) {
            setError(`Invalid link at index ${i}: Expected an object.`);
            return false;
          }

          // Check optional properties for links (id and type can be missing)
          // No validation needed for id and type as they can be undefined/null

          // Validate link structure based on type (type can be undefined/null)
          if (link.type === "SelfLink") {
            // SelfLink can have either 'node' property or 'nodeA: null, nodeB: null' structure
            const hasNodeProperty = link.node && typeof link.node === "object";
            const hasNullNodeProperties =
              link.nodeA === null && link.nodeB === null;

            if (!hasNodeProperty && !hasNullNodeProperties) {
              setError(
                `Invalid SelfLink at index ${i}: Must have either 'node' property or 'nodeA: null, nodeB: null' structure.`
              );
              return false;
            }
          } else if (link.type === "StartLink") {
            // StartLink can have either 'node' property or 'nodeA: null, nodeB: null' structure
            const hasNodeProperty = link.node && typeof link.node === "object";
            const hasNullNodeProperties =
              link.nodeA === null && link.nodeB === null;

            if (!hasNodeProperty && !hasNullNodeProperties) {
              setError(
                `Invalid StartLink at index ${i}: Must have either 'node' property or 'nodeA: null, nodeB: null' structure.`
              );
              return false;
            }
          } else {
            // Default case: Regular Link or undefined type
            // Check if it has nodeA/nodeB structure (regular link) or nodeA:null/nodeB:null (self-link without type)
            const hasRegularLinkStructure =
              link.nodeA &&
              typeof link.nodeA === "object" &&
              link.nodeB &&
              typeof link.nodeB === "object";
            const hasSelfLinkStructure =
              link.nodeA === null && link.nodeB === null;

            if (!hasRegularLinkStructure && !hasSelfLinkStructure) {
              setError(
                `Invalid link at index ${i}: Must have either regular link structure (nodeA/nodeB objects) or self-link structure (nodeA: null, nodeB: null).`
              );
              return false;
            }
          }

          // Check optional properties have correct types
          if (link.text !== undefined && typeof link.text !== "string") {
            setError(
              `Invalid link at index ${i}: 'text' property must be a string.`
            );
            return false;
          }
        }
      }

      setJsonContent(content);
      return true;
    } catch (parseError) {
      setError(`Invalid JSON format: ${parseError.message}`);
      return false;
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type based on import type
      if (importType === "automata-json") {
        if (
          !file.name.endsWith(".automata-json") &&
          !file.name.endsWith(".json")
        ) {
          setError("Please select a .automata-json file or .json file.");
          return;
        }
      } else {
        if (!file.name.endsWith(".json") && file.type !== "application/json") {
          setError("Please select a JSON file (.json extension).");
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        validateAndSetJsonContent(e.target.result);
      };
      reader.onerror = () => {
        setError("Error reading file. Please try again.");
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];

      // Validate file type based on import type
      if (importType === "automata-json") {
        if (
          !file.name.endsWith(".automata-json") &&
          !file.name.endsWith(".json")
        ) {
          setError("Please drop a .automata-json file or .json file.");
          return;
        }
      } else {
        if (!file.name.endsWith(".json") && file.type !== "application/json") {
          setError("Please drop a JSON file (.json extension).");
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        validateAndSetJsonContent(e.target.result);
      };
      reader.onerror = () => {
        setError("Error reading dropped file. Please try again.");
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    // Validate the JSON content before importing
    if (!validateAndSetJsonContent(jsonContent)) {
      return; // Error is already set by validateAndSetJsonContent
    }

    try {
      const parsedData = JSON.parse(jsonContent);

      if (importType === "automata-json") {
        // Handle .automata-json import (complete backup)
        const success = await importAutomataJSON(parsedData);
        if (success) {
          handleClose();
        }
      } else {
        // Handle single diagram JSON import
        const canvasData = parsedData;

        if (replaceMode) {
          // Replace mode: just import the canvas data, keep current diagram name/type/ID
          onImport(canvasData, diagramName);
        } else {
          // Create new mode: update diagram name and type, clear current diagram ID
          setDiagramName(localDiagramName);
          setDiagramType(localDiagramType);
          setCurrentDiagramId(null); // Clear current diagram ID for new import
          onImport(canvasData, localDiagramName);
        }

        handleClose();
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setError(`Error parsing JSON content: ${error.message}`);
    }
  };

  const handleDropdownSelect = (value) => {
    setLocalDiagramType(value);
    setIsDropdownOpen(false);
  };

  const calculateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleDropdownToggle = () => {
    if (!isDropdownOpen) {
      calculateDropdownPosition();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClose = () => {
    setLocalDiagramName(diagramName);
    setLocalDiagramType(diagramType);
    setJsonContent("");
    setIsDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {importType === "automata-json"
              ? "Import Complete Backup (.automata-json)"
              : replaceMode
              ? "Replace Diagram Data"
              : "Import Diagram from JSON"}
          </h2>
          <p className="modal-subtitle">
            {importType === "automata-json"
              ? "Import a complete backup file containing all your diagrams. This will replace your current collection with the imported diagrams."
              : replaceMode
              ? "Replace the current diagram's data with imported JSON content. The diagram name and type will be preserved."
              : "Import a diagram from a JSON file or paste JSON content directly."}
          </p>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {!replaceMode && importType === "diagram-json" && (
            <>
              <div className="form-group-compact">
                <label htmlFor="diagramName" className="form-label-compact">
                  Diagram Name
                  <span className="character-count">
                    {localDiagramName.length}/50
                  </span>
                </label>
                <input
                  id="diagramName"
                  type="text"
                  className="form-input-compact"
                  placeholder="e.g., My Imported Schema"
                  value={localDiagramName}
                  onChange={(e) => setLocalDiagramName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="form-row">
                <div className="form-group-compact">
                  <label className="form-label-compact">Diagram Type</label>
                  <div className="custom-dropdown" ref={dropdownRef}>
                    <div
                      ref={triggerRef}
                      className="custom-dropdown-trigger"
                      onClick={handleDropdownToggle}
                    >
                      <span>
                        {
                          diagramTypes.find(
                            (type) => type.value === localDiagramType
                          )?.label
                        }
                      </span>
                      <span className="dropdown-arrow">
                        {isDropdownOpen ? "▲" : "▼"}
                      </span>
                    </div>
                    {isDropdownOpen && (
                      <div
                        className="custom-dropdown-menu"
                        style={{
                          position: "fixed",
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          width: `${dropdownPosition.width}px`,
                        }}
                      >
                        {diagramTypes.map((type) => (
                          <div
                            key={type.value}
                            className={`custom-dropdown-item ${
                              localDiagramType === type.value ? "selected" : ""
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
              </div>
            </>
          )}

          {/* Upload Section */}
          <div className="import-upload-section">
            <div className="form-group-compact">
              <label
                htmlFor="fileUpload"
                className={`upload-button-compact ${
                  isDragOver ? "drag-over" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className="upload-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </span>
                <span className="upload-text">
                  {isDragOver
                    ? "Drop file here"
                    : importType === "automata-json"
                    ? "Upload .automata-json File"
                    : replaceMode
                    ? "Upload JSON File"
                    : "Upload File"}
                </span>
                <span className="upload-subtitle">
                  {isDragOver
                    ? "Release to upload"
                    : importType === "automata-json"
                    ? "Select a .automata-json file or drag & drop"
                    : replaceMode
                    ? "Replace current diagram data"
                    : "Select a JSON file or drag & drop"}
                </span>
              </label>
              <input
                id="fileUpload"
                type="file"
                accept={
                  importType === "automata-json"
                    ? ".automata-json,.json"
                    : ".json"
                }
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </div>

            <div className="import-divider">
              <span>or</span>
            </div>
          </div>

          {/* JSON Content Section */}
          <div className="form-group-compact">
            <label htmlFor="jsonContent" className="form-label-compact">
              {importType === "automata-json"
                ? "Paste .automata-json Content"
                : replaceMode
                ? "Paste JSON Content"
                : "JSON Content"}
            </label>
            <textarea
              id="jsonContent"
              className="form-textarea-compact"
              placeholder={
                importType === "automata-json"
                  ? "Paste your .automata-json content here or upload a file..."
                  : "Paste your JSON content here or upload a file..."
              }
              value={jsonContent}
              onChange={(e) => {
                setJsonContent(e.target.value);
                setError(""); // Clear error when user types
              }}
              rows={6}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="import-error-message">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={!!error || !jsonContent.trim()}
          >
            {importType === "automata-json"
              ? "Import Complete Backup"
              : replaceMode
              ? "Replace Diagram Data"
              : "Import Diagram"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportJSONModal;
