import React, { useState, useEffect, useRef } from "react";
import { useFSM } from "../../context/FSMContext.jsx";

const OperationAlerts = () => {
  const {
    shiftPressed,
    historyIndex,
    history,
    nodes,
    links,
    selectedObject,
    clipboard,
  } = useFSM();

  const [notifications, setNotifications] = useState([]);
  const prevStateRef = useRef({
    historyIndex: 0,
    historyLength: 0,
    nodesLength: 0,
    linksLength: 0,
    selectedObject: null,
    clipboard: null,
    shiftPressed: false,
  });

  // Track state changes and show notifications
  useEffect(() => {
    const prevState = prevStateRef.current;
    const newNotifications = [];

    // Undo action - historyIndex decreases when undoing
    // Only show if it's a single step decrease (not a history reset)
    if (
      historyIndex < prevState.historyIndex &&
      prevState.historyIndex - historyIndex === 1
    ) {
      newNotifications.push({
        id: `undo-${Date.now()}`,
        type: "success",
        message: "Undo",
        icon: "fas fa-undo",
        duration: 1000,
      });
    }

    // Redo action - historyIndex increases when redoing
    // Only show if it's a single step increase within existing history (not new entries)
    if (
      historyIndex > prevState.historyIndex &&
      historyIndex - prevState.historyIndex === 1 &&
      historyIndex <= prevState.historyLength &&
      history.length === prevState.historyLength
    ) {
      newNotifications.push({
        id: `redo-${Date.now()}`,
        type: "success",
        message: "Redo",
        icon: "fas fa-redo",
        duration: 1000,
      });
    }

    // Clear all action
    if (
      prevState.nodesLength > 0 &&
      prevState.linksLength > 0 &&
      nodes.length === 0 &&
      links.length === 0
    ) {
      newNotifications.push({
        id: `clear-all-${Date.now()}`,
        type: "warning",
        message: "Canvas Cleared",
        icon: "fas fa-trash",
        duration: 1000,
      });
    }

    // Clear nodes action
    if (
      prevState.nodesLength > 0 &&
      nodes.length === 0 &&
      links.length === prevState.linksLength
    ) {
      newNotifications.push({
        id: `clear-nodes-${Date.now()}`,
        type: "warning",
        message: "States Cleared",
        icon: "fas fa-circle",
        duration: 1000,
      });
    }

    // Clear links action
    if (
      prevState.linksLength > 0 &&
      links.length === 0 &&
      nodes.length === prevState.nodesLength
    ) {
      newNotifications.push({
        id: `clear-links-${Date.now()}`,
        type: "warning",
        message: "Transitions Cleared",
        icon: "fas fa-arrow-right",
        duration: 1000,
      });
    }

    // Shift mode notification
    if (shiftPressed && !prevState.shiftPressed) {
      newNotifications.push({
        id: `shift-mode-${Date.now()}`,
        type: "info",
        message: "Shift Mode: Creating Transitions",
        icon: "fas fa-link",
        duration: 1000,
      });
    }

    // Copy action
    if (!prevState.clipboard && clipboard) {
      newNotifications.push({
        id: `copy-${Date.now()}`,
        type: "success",
        message: "Copied",
        icon: "fas fa-copy",
        duration: 1000,
      });
    }

    // Paste action
    if (prevState.clipboard && !clipboard) {
      newNotifications.push({
        id: `paste-${Date.now()}`,
        type: "success",
        message: "Pasted",
        icon: "fas fa-paste",
        duration: 1000,
      });
    }

    // Add new notifications, but prevent duplicates of the same type
    if (newNotifications.length > 0) {
      setNotifications((prev) => {
        const existingTypes = prev.map((n) => n.type + n.message);
        const filteredNew = newNotifications.filter(
          (n) => !existingTypes.includes(n.type + n.message)
        );
        return [...prev, ...filteredNew];
      });
    }

    // Update previous state
    prevStateRef.current = {
      historyIndex,
      historyLength: history.length,
      nodesLength: nodes.length,
      linksLength: links.length,
      selectedObject,
      clipboard,
      shiftPressed,
    };
  }, [
    shiftPressed,
    historyIndex,
    history.length,
    nodes.length,
    links.length,
    selectedObject,
    clipboard,
  ]);

  // Auto-remove notifications after their duration
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration) {
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
        }, notification.duration);
      }
    });
  }, [notifications]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="operation-alerts">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`operation-alert ${notification.type}`}
        >
          <i className={notification.icon}></i>
          <span className="alert-message">{notification.message}</span>
        </div>
      ))}
    </div>
  );
};

export default OperationAlerts;
