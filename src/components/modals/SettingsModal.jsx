import React, { useState, useRef, useEffect } from "react";
import ColorPicker from "../ui/ColorPicker";
import { useFSM } from "../../context/FSMContext.jsx";

const SettingsModal = ({ isOpen, onClose }) => {
  const {
    stateColor,
    setStateColor,
    transitionColor,
    setTransitionColor,
    stateStrokeWidth,
    setStateStrokeWidth,
    transitionStrokeWidth,
    setTransitionStrokeWidth,
    stateFilled,
    setStateFilled,
    theme,
    setTheme,
    gridLines,
    setGridLines,
    fontFamily,
    setFontFamily,
    stateTextColor,
    setStateTextColor,
    stateTextSize,
    transitionTextColor,
    setTransitionTextColor,
    transitionTextSize,
    setTransitionTextSize,
    setStateTextSize,
    accentColor,
    setAccentColor,
    diagramCanvasSize,
    setDiagramCanvasSize,
    resetAllPreferences,
  } = useFSM();

  // Font dropdown state
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [fontDropdownPosition, setFontDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const fontDropdownRef = useRef(null);
  const fontTriggerRef = useRef(null);

  // Canvas size dropdown state
  const [isCanvasSizeDropdownOpen, setIsCanvasSizeDropdownOpen] =
    useState(false);
  const [canvasSizeDropdownPosition, setCanvasSizeDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const canvasSizeDropdownRef = useRef(null);
  const canvasSizeTriggerRef = useRef(null);

  // Font options with display names
  const fontOptions = [
    { value: "Arial, sans-serif", label: "Arial", font: "Arial, sans-serif" },
    {
      value: "Helvetica, sans-serif",
      label: "Helvetica",
      font: "Helvetica, sans-serif",
    },
    { value: "Georgia, serif", label: "Georgia", font: "Georgia, serif" },
    {
      value: "Times New Roman, serif",
      label: "Times New Roman",
      font: "Times New Roman, serif",
    },
    {
      value: "Courier New, monospace",
      label: "Courier New",
      font: "Courier New, monospace",
    },
    {
      value: "Verdana, sans-serif",
      label: "Verdana",
      font: "Verdana, sans-serif",
    },
    {
      value: "Trebuchet MS, sans-serif",
      label: "Trebuchet MS",
      font: "Trebuchet MS, sans-serif",
    },
    {
      value: "Impact, sans-serif",
      label: "Impact",
      font: "Impact, sans-serif",
    },
  ];

  // Calculate dropdown position
  const calculateFontDropdownPosition = () => {
    if (fontTriggerRef.current) {
      const rect = fontTriggerRef.current.getBoundingClientRect();
      setFontDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // Handle font dropdown toggle
  const handleFontDropdownToggle = () => {
    if (!isFontDropdownOpen) {
      calculateFontDropdownPosition();
    }
    setIsFontDropdownOpen(!isFontDropdownOpen);
  };

  // Handle font selection
  const handleFontSelect = (fontValue) => {
    setFontFamily(fontValue);
    setIsFontDropdownOpen(false);
  };

  // Handle canvas size dropdown toggle
  const handleCanvasSizeDropdownToggle = () => {
    if (isCanvasSizeDropdownOpen) {
      setIsCanvasSizeDropdownOpen(false);
    } else {
      // Close font dropdown if open
      setIsFontDropdownOpen(false);

      // Calculate position for canvas size dropdown
      if (canvasSizeTriggerRef.current) {
        const rect = canvasSizeTriggerRef.current.getBoundingClientRect();
        setCanvasSizeDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
      setIsCanvasSizeDropdownOpen(true);
    }
  };

  // Handle canvas size selection
  const handleCanvasSizeSelect = (sizeValue) => {
    setDiagramCanvasSize(sizeValue);
    setIsCanvasSizeDropdownOpen(false);
  };

  // Canvas size options
  const canvasSizeOptions = [
    {
      value: "small",
      label: "Small (800x600)",
      description: "Compact workspace",
    },
    {
      value: "medium",
      label: "Medium (1200x800)",
      description: "Standard workspace",
    },
    {
      value: "large",
      label: "Large (1600x1000)",
      description: "Spacious workspace",
    },
    {
      value: "xlarge",
      label: "Extra Large (2000x1200)",
      description: "Maximum workspace",
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        fontDropdownRef.current &&
        !fontDropdownRef.current.contains(event.target)
      ) {
        setIsFontDropdownOpen(false);
      }
      if (
        canvasSizeDropdownRef.current &&
        !canvasSizeDropdownRef.current.contains(event.target)
      ) {
        setIsCanvasSizeDropdownOpen(false);
      }
    };

    if (isFontDropdownOpen || isCanvasSizeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFontDropdownOpen, isCanvasSizeDropdownOpen]);

  if (!isOpen) return null;

  const settings = [
    {
      category: "Appearance",
      items: [
        {
          name: "Theme",
          control: (
            <div className="theme-options">
              {["light", "dark", "system"].map((option) => (
                <button
                  key={option}
                  className={`theme-option ${
                    theme === option ? "selected" : ""
                  }`}
                  onClick={() => setTheme(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          ),
        },
        {
          name: "Guide Lines",
          control: (
            <div className="theme-options">
              {[
                { value: "grid", label: "Grid", pattern: "⬜⬜⬜" },
                { value: "dotted", label: "Dotted", pattern: "⋯⋯⋯" },
                { value: "none", label: "None", pattern: "━━━" },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`theme-option ${
                    gridLines === option.value ? "selected" : ""
                  }`}
                  onClick={() => setGridLines(option.value)}
                >
                  {option.pattern}
                </button>
              ))}
            </div>
          ),
        },
        {
          name: "Accent Color",
          control: (
            <ColorPicker
              value={accentColor}
              onChange={setAccentColor}
              presets={[
                "#3b82f6", // Blue
                "#ef4444", // Red
                "#10b981", // Green
                "#f59e0b", // Yellow
                "#8b5cf6", // Purple
                "#06b6d4", // Cyan
                "#f97316", // Orange
                "#ec4899", // Pink
              ]}
            />
          ),
        },
        {
          name: "Reset Preferences",
          control: (
            <button
              className="theme-option"
              onClick={resetAllPreferences}
              style={{
                backgroundColor: "#ef4444",
                color: "white",
                border: "1px solid #dc2626",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Reset to Default
            </button>
          ),
        },
      ],
    },
    {
      category: "States",
      items: [
        {
          name: "State Color",
          control: (
            <ColorPicker
              value={stateColor}
              onChange={setStateColor}
              presets={[
                "#3b82f6", // Blue
                "#ef4444", // Red
                "#10b981", // Green
                "#f59e0b", // Orange
                "#8b5cf6", // Purple
                "#6b7280", // Gray
                "#dc2626", // Dark Red
                "#059669", // Dark Green
                "#d97706", // Dark Orange
                "#7c3aed", // Dark Purple
                "#1f2937", // Dark Gray
                "#000000", // Black
              ]}
            />
          ),
        },
        {
          name: "State Stroke Width",
          control: (
            <div className="slider-control">
              <input
                type="range"
                min="1"
                max="5"
                value={stateStrokeWidth}
                onChange={(e) => setStateStrokeWidth(parseInt(e.target.value))}
                className="stroke-width-slider"
              />
              <span className="slider-value">{stateStrokeWidth}px</span>
            </div>
          ),
        },
        {
          name: "State Fill",
          control: (
            <div className="theme-options">
              {[
                { value: true, label: "Filled" },
                { value: false, label: "Outline" },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`theme-option ${
                    stateFilled === option.value ? "selected" : ""
                  }`}
                  onClick={() => setStateFilled(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      category: "Transitions",
      items: [
        {
          name: "Transition Color",
          control: (
            <ColorPicker
              value={transitionColor}
              onChange={setTransitionColor}
              presets={[
                "#6b7280", // Gray
                "#dc2626", // Red
                "#059669", // Green
                "#d97706", // Orange
                "#7c3aed", // Purple
                "#3b82f6", // Blue
                "#ef4444", // Light Red
                "#10b981", // Light Green
                "#f59e0b", // Light Orange
                "#8b5cf6", // Light Purple
                "#1f2937", // Dark Gray
                "#000000", // Black
              ]}
            />
          ),
        },
        {
          name: "Transition Stroke Width",
          control: (
            <div className="slider-control">
              <input
                type="range"
                min="1"
                max="5"
                value={transitionStrokeWidth}
                onChange={(e) =>
                  setTransitionStrokeWidth(parseInt(e.target.value))
                }
                className="stroke-width-slider"
              />
              <span className="slider-value">{transitionStrokeWidth}px</span>
            </div>
          ),
        },
      ],
    },
    {
      category: "Text",
      items: [
        {
          name: "Font Family",
          control: (
            <div className="custom-dropdown" ref={fontDropdownRef}>
              <div
                ref={fontTriggerRef}
                className="custom-dropdown-trigger"
                onClick={handleFontDropdownToggle}
              >
                <span style={{ fontFamily: fontFamily }}>
                  {fontOptions.find((option) => option.value === fontFamily)
                    ?.label || "Select Font"}
                </span>
                <span className="dropdown-arrow">▼</span>
              </div>
              {isFontDropdownOpen && (
                <div
                  className="custom-dropdown-menu"
                  style={{
                    position: "fixed",
                    top: `${fontDropdownPosition.top}px`,
                    left: `${fontDropdownPosition.left}px`,
                    width: `${fontDropdownPosition.width}px`,
                    zIndex: 10000,
                  }}
                >
                  {fontOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`custom-dropdown-item ${
                        fontFamily === option.value ? "selected" : ""
                      }`}
                      onClick={() => handleFontSelect(option.value)}
                      style={{ fontFamily: option.font }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
        },
        {
          name: "Canvas Size",
          control: (
            <div className="custom-dropdown" ref={canvasSizeDropdownRef}>
              <div
                ref={canvasSizeTriggerRef}
                className="custom-dropdown-trigger"
                onClick={handleCanvasSizeDropdownToggle}
              >
                <span>
                  {canvasSizeOptions.find(
                    (option) => option.value === diagramCanvasSize
                  )?.label || "Select Canvas Size"}
                </span>
                <span className="dropdown-arrow">▼</span>
              </div>
              {isCanvasSizeDropdownOpen && (
                <div
                  className="custom-dropdown-menu"
                  style={{
                    position: "fixed",
                    top: `${canvasSizeDropdownPosition.top}px`,
                    left: `${canvasSizeDropdownPosition.left}px`,
                    width: `${canvasSizeDropdownPosition.width}px`,
                    zIndex: 10000,
                  }}
                >
                  {canvasSizeOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`custom-dropdown-item ${
                        diagramCanvasSize === option.value ? "selected" : ""
                      }`}
                      onClick={() => handleCanvasSizeSelect(option.value)}
                    >
                      <div className="dropdown-item-content">
                        <div className="dropdown-item-label">
                          {option.label}
                        </div>
                        <div className="dropdown-item-description">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
        },
        {
          name: "State Text Color",
          control: (
            <ColorPicker
              value={stateTextColor}
              onChange={setStateTextColor}
              presets={[
                "#000000", // Black
                "#374151", // Dark Gray
                "#6b7280", // Gray
                "#dc2626", // Red
                "#059669", // Green
                "#d97706", // Orange
                "#7c3aed", // Purple
                "#3b82f6", // Blue
                "#ef4444", // Light Red
                "#10b981", // Light Green
                "#f59e0b", // Light Orange
                "#8b5cf6", // Light Purple
              ]}
            />
          ),
        },
        {
          name: "Transition Text Color",
          control: (
            <ColorPicker
              value={transitionTextColor}
              onChange={setTransitionTextColor}
              presets={[
                "#000000", // Black
                "#374151", // Dark Gray
                "#6b7280", // Gray
                "#dc2626", // Red
                "#059669", // Green
                "#d97706", // Orange
                "#7c3aed", // Purple
                "#3b82f6", // Blue
                "#ef4444", // Light Red
                "#10b981", // Light Green
                "#f59e0b", // Light Orange
                "#8b5cf6", // Light Purple
              ]}
            />
          ),
        },
        {
          name: "State Text Size",
          control: (
            <div className="slider-control">
              <input
                type="range"
                min="8"
                max="24"
                value={stateTextSize}
                onChange={(e) => setStateTextSize(parseInt(e.target.value))}
                className="stroke-width-slider"
              />
              <span className="slider-value">{stateTextSize}px</span>
            </div>
          ),
        },
        {
          name: "Transition Text Size",
          control: (
            <div className="slider-control">
              <input
                type="range"
                min="8"
                max="24"
                value={transitionTextSize}
                onChange={(e) =>
                  setTransitionTextSize(parseInt(e.target.value))
                }
                className="stroke-width-slider"
              />
              <span className="slider-value">{transitionTextSize}px</span>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Preferences</h2>
          <p className="modal-subtitle">
            Customize the appearance and behavior of your FSM.
          </p>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {settings.map((section, sectionIndex) => (
            <div key={sectionIndex} className="settings-section">
              <h3 className="settings-category">{section.category}</h3>
              <div className="settings-table">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="settings-row">
                    <div className="settings-column setting-name">
                      {item.name}
                    </div>
                    <div className="settings-column setting-control">
                      {item.control}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
