import React from "react";
import { SHORTCUTS } from "../../utils/shortcuts.js";

const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    // Homepage & General
    { key: SHORTCUTS.CREATE_NEW, description: "Create New Diagram" },
    { key: SHORTCUTS.GRID_VIEW, description: "Toggle Grid View" },
    { key: SHORTCUTS.LIST_VIEW, description: "List View" },
    { key: SHORTCUTS.IMPORT_JSON, description: "Import JSON" },
    { key: SHORTCUTS.HOME, description: "Go to Home" },

    // Canvas & Editing
    { key: "Double Click", description: "Create state" },
    { key: "Shift + Drag", description: "Create transition" },
    { key: "Delete", description: "Delete selected object" },
    { key: "Escape", description: "Deselect object" },
    { key: SHORTCUTS.SELECT_ALL, description: "Select all" },
    { key: SHORTCUTS.COPY, description: "Copy selection" },
    { key: SHORTCUTS.PASTE, description: "Paste selection" },
    { key: SHORTCUTS.UNDO, description: "Undo" },
    { key: SHORTCUTS.REDO, description: "Redo" },
    { key: SHORTCUTS.SAVE_JSON, description: "Save JSON" },

    // Canvas Navigation
    { key: SHORTCUTS.ZOOM_IN, description: "Zoom in" },
    { key: SHORTCUTS.ZOOM_OUT, description: "Zoom out" },
    { key: SHORTCUTS.ZOOM_RESET, description: "Reset zoom" },
    { key: "Ctrl + Mouse Wheel", description: "Zoom in/out" },
    { key: "Space + Drag", description: "Pan canvas" },
    { key: "Middle Click + Drag", description: "Pan canvas" },

    // Interface & Settings
    { key: SHORTCUTS.TOGGLE_SIDEBAR, description: "Hide/Show Sidebar" },
    { key: SHORTCUTS.PREFERENCES, description: "Open Preferences" },
    { key: SHORTCUTS.SHORTCUTS, description: "Open Shortcuts List" },
    { key: SHORTCUTS.SPECIAL_CHARS, description: "Open Special Characters" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Keyboard Shortcuts</h2>
          <p className="modal-subtitle">
            Use these shortcuts to speed up your workflow.
          </p>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="shortcuts-table">
            <div className="shortcuts-header">
              <div className="shortcuts-column">Command</div>
              <div className="shortcuts-column">Shortcut</div>
            </div>
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="shortcuts-row">
                <div className="shortcuts-column command-column">
                  {shortcut.description}
                </div>
                <div className="shortcuts-column shortcut-column">
                  <span className="shortcut-key">{shortcut.key}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
