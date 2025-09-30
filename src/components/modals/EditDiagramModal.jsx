import React, { useState, useEffect, useRef } from "react";
import { useFSM } from "../../context/FSMContext";

const EditDiagramModal = ({ isOpen, onClose, diagram, onSave }) => {
  const { updateDiagramMetadata, actions } = useFSM();
  const { showConfirmation } = actions;
  const [formData, setFormData] = useState({
    name: "",
    type: "DFA",
    accentColor: "#36454f",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && diagram) {
      setFormData({
        name: diagram.name || "",
        type: diagram.type || "DFA",
        accentColor: diagram.accentColor || "#36454f",
      });
    }
  }, [isOpen, diagram]);

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

  const diagramTypes = [
    { value: "DFA", label: "DFA (Deterministic Finite Automaton)" },
    { value: "NFA", label: "NFA (Non-deterministic Finite Automaton)" },
    { value: "PDA", label: "PDA (Pushdown Automaton)" },
    { value: "Turing Machine", label: "Turing Machine" },
    { value: "Other", label: "Other" },
  ];

  const accentColors = [
    { value: "#36454f", label: "Default" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#10b981", label: "Green" },
    { value: "#f59e0b", label: "Orange" },
    { value: "#ef4444", label: "Red" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#06b6d4", label: "Cyan" },
    { value: "#84cc16", label: "Lime" },
    { value: "#f97316", label: "Amber" },
    { value: "#ec4899", label: "Pink" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleDropdownSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));
    setIsDropdownOpen(false);
  };

  const handleSave = async () => {
    // Validate diagram name
    if (!formData.name.trim()) {
      showConfirmation({
        title: "Invalid Name",
        message: "Please enter a diagram name.",
        confirmText: "OK",
        cancelText: "", // Empty string to hide cancel button
        type: "warning",
      });
      return;
    }

    try {
      // Update the diagram metadata directly in the database
      await updateDiagramMetadata(diagram.id, {
        name: formData.name.trim(),
        type: formData.type,
        accentColor: formData.accentColor,
      });

      onClose();

      // Call the onSave callback to refresh the diagrams list
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Failed to save diagram changes:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      type: "DFA",
      accentColor: "#36454f",
    });
    onClose();
  };

  if (!isOpen || !diagram) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Diagram</h2>
          <p className="modal-subtitle">
            Update the diagram name, type, and accent color.
          </p>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group-compact">
            <label htmlFor="diagram-name" className="form-label-compact">
              Diagram Name
              <span className="character-count">{formData.name.length}/50</span>
            </label>
            <input
              id="diagram-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="form-input-compact"
              placeholder="Enter diagram name"
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="form-group-compact">
            <label htmlFor="diagram-type" className="form-label-compact">
              Diagram Type
            </label>
            <div className="custom-dropdown" ref={dropdownRef}>
              <div
                ref={triggerRef}
                className="custom-dropdown-trigger"
                onClick={handleDropdownToggle}
              >
                <span>
                  {
                    diagramTypes.find((type) => type.value === formData.type)
                      ?.label
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
                        formData.type === type.value ? "selected" : ""
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

          <div className="form-group-compact">
            <label className="form-label-compact">Card Accent Color</label>
            <div className="color-picker-grid">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  className={`color-option ${
                    formData.accentColor === color.value ? "selected" : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleInputChange("accentColor", color.value)}
                  title={color.label}
                >
                  {formData.accentColor === color.value && (
                    <i className="fas fa-check color-check"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDiagramModal;
