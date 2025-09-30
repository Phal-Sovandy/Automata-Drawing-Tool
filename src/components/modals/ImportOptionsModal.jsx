import React from "react";

const ImportOptionsModal = ({ isOpen, onClose, onSelectOption }) => {
  if (!isOpen) return null;

  const handleOptionSelect = (option) => {
    onSelectOption(option);
    onClose();
  };

  return (
    <div className="modal-overlay import-options-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Import Options</h2>
          <p className="modal-subtitle">
            Choose what type of file you want to import:
          </p>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="import-options">
            <div
              className="import-option"
              onClick={() => handleOptionSelect("automata-json")}
            >
              <div className="import-option-header">
                <div className="import-icon automata-icon">
                  <i className="fas fa-database"></i>
                </div>
                <div className="import-option-info">
                  <h3 className="import-option-title">
                    Complete Backup
                    <br />
                    <span className="file-extension">(.automata-json)</span>
                  </h3>
                  <p className="import-option-description">
                    Import a complete backup file containing all your diagrams.
                    This will restore your entire diagram collection and replace
                    your current workspace.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="import-option"
              onClick={() => handleOptionSelect("diagram-json")}
            >
              <div className="import-option-header">
                <div className="import-icon diagram-icon">
                  <i className="fas fa-project-diagram"></i>
                </div>
                <div className="import-option-info">
                  <h3 className="import-option-title">
                    Single Diagram
                    <br />
                    <span className="file-extension">(.json)</span>
                  </h3>
                  <p className="import-option-description">
                    Import a single diagram from a JSON file. This will create a
                    new diagram in your collection with the imported canvas
                    data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportOptionsModal;
