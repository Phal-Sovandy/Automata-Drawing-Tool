import React, { useState } from "react";
import { useFSM } from "../../context/FSMContext.jsx";

const ExportModal = ({ isOpen, onClose }) => {
  const {
    exportAllPNG,
    exportHighResPNG,
    exportAllHighResPNG,
    exportAllSVG,
    exportAllLaTeX,
    exportJSON,
  } = useFSM();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (exportFunction, format) => {
    setIsExporting(true);
    try {
      await exportFunction();
      // Show success message briefly
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content export-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Export Diagram</h2>
          <p className="modal-subtitle">
            Choose how you'd like to export your diagram:
          </p>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="export-options">
            <div
              className="export-option"
              onClick={() => handleExport(exportJSON, "JSON")}
              style={{ cursor: isExporting ? "not-allowed" : "pointer" }}
            >
              <div className="export-option-header">
                <div className="export-icon json-icon">
                  <i className="fas fa-file-code"></i>
                </div>
                <div className="export-option-info">
                  <h3 className="export-option-title">All Diagrams Backup</h3>
                  <p className="export-option-description">
                    Export all saved diagrams as .automata-json file for
                    complete backup and sharing.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="export-option"
              onClick={() => handleExport(exportAllPNG, "PNG")}
              style={{ cursor: isExporting ? "not-allowed" : "pointer" }}
            >
              <div className="export-option-header">
                <div className="export-icon png-icon">
                  <i className="fas fa-image"></i>
                </div>
                <div className="export-option-info">
                  <h3 className="export-option-title">PNG Images</h3>
                  <p className="export-option-description">
                    Export all diagrams as PNG images in a zip file. Perfect for
                    presentations and documents.
                  </p>
                </div>
              </div>
              <div className="export-btn-group">
                <button
                  className="export-btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport(exportHighResPNG, "High-Res PNG");
                  }}
                  disabled={isExporting}
                >
                  High-Res
                </button>
                <button
                  className="export-btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport(exportAllHighResPNG, "All High-Res PNG");
                  }}
                  disabled={isExporting}
                >
                  All High-Res
                </button>
              </div>
            </div>

            <div
              className="export-option"
              onClick={() => handleExport(exportAllSVG, "SVG")}
              style={{ cursor: isExporting ? "not-allowed" : "pointer" }}
            >
              <div className="export-option-header">
                <div className="export-icon svg-icon">
                  <i className="fas fa-code"></i>
                </div>
                <div className="export-option-info">
                  <h3 className="export-option-title">SVG Vectors</h3>
                  <p className="export-option-description">
                    Export all diagrams as SVG files in a zip file. Ideal for
                    web use and further editing.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="export-option"
              onClick={() => handleExport(exportAllLaTeX, "LaTeX")}
              style={{ cursor: isExporting ? "not-allowed" : "pointer" }}
            >
              <div className="export-option-header">
                <div className="export-icon latex-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="export-option-info">
                  <h3 className="export-option-title">LaTeX Files</h3>
                  <p className="export-option-description">
                    Export all diagrams as LaTeX TikZ files in a zip file.
                    Perfect for academic papers and publications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isExporting && (
          <div className="export-loading">
            <div className="loading-spinner"></div>
            <p>Exporting...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportModal;
