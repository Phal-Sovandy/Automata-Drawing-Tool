import React from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "",
          confirmClass: "btn-danger",
          iconColor: "#ef4444",
        };
      case "warning":
        return {
          icon: "",
          confirmClass: "btn-warning",
          iconColor: "#f59e0b",
        };
      case "info":
        return {
          icon: "",
          confirmClass: "btn-primary",
          iconColor: "#3b82f6",
        };
      default:
        return {
          icon: "",
          confirmClass: "btn-primary",
          iconColor: "#6b7280",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-content confirmation-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="confirmation-message">{message}</p>
        </div>

        <div className="modal-footer">
          {cancelText && (
            <button className="btn-secondary" onClick={handleClose}>
              {cancelText}
            </button>
          )}
          <button className={typeStyles.confirmClass} onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
