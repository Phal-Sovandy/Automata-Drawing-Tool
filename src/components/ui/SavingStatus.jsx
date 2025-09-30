import React from "react";
import { useFSM } from "../../context/FSMContext.jsx";

const SavingStatus = () => {
  const { savingStatus } = useFSM();

  const getStatusDisplay = () => {
    switch (savingStatus) {
      case "saving":
        return {
          text: "Saving...",
          className: "nav-saving-status saving",
          icon: "fas fa-spinner fa-spin",
          show: true,
        };
      case "saved":
        return {
          text: "Saved",
          className: "nav-saving-status saved",
          icon: "fas fa-check",
          show: true,
        };
      case "error":
        return {
          text: "Save Error",
          className: "nav-saving-status error",
          icon: "fas fa-exclamation-triangle",
          show: true,
        };
      case "idle":
      default:
        return {
          text: "",
          className: "nav-saving-status idle",
          icon: "",
          show: false,
        };
    }
  };

  const status = getStatusDisplay();

  // Don't render anything when idle
  if (!status.show) {
    return null;
  }

  return (
    <div className={status.className}>
      <i className={status.icon}></i>
      <span className="saving-text">{status.text}</span>
    </div>
  );
};

export default SavingStatus;
