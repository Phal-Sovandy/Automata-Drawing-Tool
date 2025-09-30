import React, { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";

const ColorPicker = ({
  value = "#3b82f6",
  onChange,
  className = "",
  presets = [
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
  ],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(value);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    setSelectedColor(value);
  }, [value]);

  const handleClickOutside = (event) => {
    if (
      colorPickerRef.current &&
      !colorPickerRef.current.contains(event.target)
    ) {
      setIsOpen(false);
      setShowCustomPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePresetClick = (color) => {
    setSelectedColor(color);
    onChange?.(color);
    setIsOpen(false);
    setShowCustomPicker(false);
  };

  const handleCustomColorChange = (color) => {
    setSelectedColor(color.hex);
    onChange?.(color.hex);
  };

  const handleHexInputChange = (event) => {
    const hex = event.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setSelectedColor(hex);
      onChange?.(hex);
    }
  };

  return (
    <div ref={colorPickerRef} className={`color-picker-container ${className}`}>
      <div
        className="color-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: selectedColor }}
      >
        <div className="color-picker-icon">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="color-picker-dropdown">
          <div className="color-presets">
            <div className="presets-header">Preset Colors</div>
            <div className="presets-grid">
              {presets.map((color, index) => (
                <div
                  key={index}
                  className={`preset-color ${
                    selectedColor === color ? "selected" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="custom-color-section">
            <div className="custom-color-header">
              <span>Custom Color</span>
            </div>

            {!showCustomPicker && (
              <div className="custom-picker-container">
                <div
                  className="color-preview clickable"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setShowCustomPicker(true)}
                >
                  <div className="color-picker-icon">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </div>
                </div>
                <div className="color-input-wrapper">
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={handleHexInputChange}
                    className="hex-input"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}

            {showCustomPicker && (
              <div className="custom-color-picker-panel">
                <SketchPicker
                  color={selectedColor}
                  onChange={handleCustomColorChange}
                  disableAlpha={true}
                  presetColors={[]}
                  width="100%"
                />
                <div className="hex-input-container">
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={handleHexInputChange}
                    className="hex-input"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
