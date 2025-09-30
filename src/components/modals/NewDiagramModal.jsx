import React, { useState, useEffect, useRef } from "react";

const NewDiagramModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "DFA",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        type: "DFA",
      });
    }
  }, [isOpen]);

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDropdownSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreate(formData.name.trim(), formData.type);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Diagram</h2>
          <p className="modal-subtitle">
            Enter a name and choose the type of diagram you want to create.
          </p>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group-compact">
              <label htmlFor="diagram-name" className="form-label-compact">
                Diagram Name
                <span className="character-count">
                  {formData.name.length}/50
                </span>
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
                required
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
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Diagram
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDiagramModal;
