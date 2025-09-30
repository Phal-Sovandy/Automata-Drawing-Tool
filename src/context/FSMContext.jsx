import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as ExportUtils from "../utils/ExportUtils.jsx";
import { ExportAsSVG, ExportAsLaTeX } from "../utils/ExportUtils.jsx";

import {
  Node,
  Link,
  SelfLink,
  StartLink,
  StandaloneArrow,
} from "../utils/FSMClasses";
import indexedDBManager from "../utils/IndexedDBUtils";
import JSZip from "jszip";

const reconstructNode = (nodeData) => {
  if (!nodeData || typeof nodeData !== "object") {
    return new Node(0, 0);
  }

  const x = typeof nodeData.x === "number" ? nodeData.x : 0;
  const y = typeof nodeData.y === "number" ? nodeData.y : 0;

  const node = new Node(x, y);
  node.id =
    nodeData.id ||
    `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  node.mouseOffsetX = nodeData.mouseOffsetX || 0;
  node.mouseOffsetY = nodeData.mouseOffsetY || 0;
  node.isAcceptState = nodeData.isAcceptState || false;
  node.text = nodeData.text || "";
  return node;
};

const reconstructLink = (linkData, nodes) => {
  if (!linkData || typeof linkData !== "object") {
    return null;
  }

  let link = null;

  if (linkData.type === "SelfLink") {
    const node = nodes.find(
      (n) => n.x === linkData.node.x && n.y === linkData.node.y
    );

    if (!node) {
      return null;
    }

    link = new SelfLink(node, { x: node.x, y: node.y });
    link.id =
      linkData.id ||
      `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    link.text = linkData.text || "";
    link.anchorAngle = linkData.anchorAngle || 0;
    link.loopRadius = linkData.loopRadius || 1.5;
  } else if (linkData.type === "StartLink") {
    const node = nodes.find(
      (n) => n.x === linkData.node.x && n.y === linkData.node.y
    );

    if (!node) {
      return null;
    }

    link = new StartLink(node, null);
    link.id =
      linkData.id ||
      `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    link.text = linkData.text || "";
    link.deltaX = linkData.deltaX || 0;
    link.deltaY = linkData.deltaY || 0;
  } else {
    if (
      !linkData.nodeA ||
      !linkData.nodeB ||
      typeof linkData.nodeA !== "object" ||
      typeof linkData.nodeB !== "object" ||
      typeof linkData.nodeA.x !== "number" ||
      typeof linkData.nodeA.y !== "number" ||
      typeof linkData.nodeB.x !== "number" ||
      typeof linkData.nodeB.y !== "number"
    ) {
      return null;
    }

    const nodeA = nodes.find(
      (n) => n.x === linkData.nodeA.x && n.y === linkData.nodeA.y
    );
    const nodeB = nodes.find(
      (n) => n.x === linkData.nodeB.x && n.y === linkData.nodeB.y
    );

    if (!nodeA || !nodeB) {
      return null;
    }

    link = new Link(nodeA, nodeB);
    link.id =
      linkData.id ||
      `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    link.text = linkData.text || "";
    link.lineAngleAdjust = linkData.lineAngleAdjust || 0;
    link.parallelPart = linkData.parallelPart || 0.5;
    link.perpendicularPart = linkData.perpendicularPart || 0;
  }

  return link;
};

const FSMContext = createContext();
const FSM_ACTIONS = {
  ADD_NODE: "ADD_NODE",
  UPDATE_NODE: "UPDATE_NODE",
  DELETE_NODE: "DELETE_NODE",
  ADD_LINK: "ADD_LINK",
  UPDATE_LINK: "UPDATE_LINK",
  DELETE_LINK: "DELETE_LINK",
  SELECT_OBJECT: "SELECT_OBJECT",
  ADD_TO_SELECTION: "ADD_TO_SELECTION",
  SELECT_ALL: "SELECT_ALL",
  SET_CURRENT_LINK: "SET_CURRENT_LINK",
  CLEAR_CURRENT_LINK: "CLEAR_CURRENT_LINK",
  SET_MOVING_OBJECT: "SET_MOVING_OBJECT",
  SET_SHIFT_PRESSED: "SET_SHIFT_PRESSED",
  SET_ALT_PRESSED: "SET_ALT_PRESSED",
  CLEAR_ALL: "CLEAR_ALL",
  CLEAR_ALL_NODES: "CLEAR_ALL_NODES",
  CLEAR_ALL_LINKS: "CLEAR_ALL_LINKS",
  CREATE_NEW_DIAGRAM: "CREATE_NEW_DIAGRAM",
  SET_NODE_RADIUS: "SET_NODE_RADIUS",
  SET_STATE_COLOR: "SET_STATE_COLOR",
  SET_TRANSITION_COLOR: "SET_TRANSITION_COLOR",
  SET_STATE_STROKE_WIDTH: "SET_STATE_STROKE_WIDTH",
  SET_TRANSITION_STROKE_WIDTH: "SET_TRANSITION_STROKE_WIDTH",
  SET_STATE_FILLED: "SET_STATE_FILLED",
  SET_THEME: "SET_THEME",
  SET_GRID_LINES: "SET_GRID_LINES",
  SET_TEXT_COLOR: "SET_TEXT_COLOR",
  SET_TEXT_SIZE: "SET_TEXT_SIZE",
  SET_FONT_FAMILY: "SET_FONT_FAMILY",
  SET_STATE_TEXT_COLOR: "SET_STATE_TEXT_COLOR",
  SET_STATE_TEXT_SIZE: "SET_STATE_TEXT_SIZE",
  SET_TRANSITION_TEXT_COLOR: "SET_TRANSITION_TEXT_COLOR",
  SET_TRANSITION_TEXT_SIZE: "SET_TRANSITION_TEXT_SIZE",
  SET_ACCENT_COLOR: "SET_ACCENT_COLOR",
  SET_ZOOM: "SET_ZOOM",
  SET_PAN: "SET_PAN",
  SET_PANNING: "SET_PANNING",
  SET_SPACE_PRESSED: "SET_SPACE_PRESSED",
  RESET_ZOOM: "RESET_ZOOM",
  RESET_TO_THEME_DEFAULTS: "RESET_TO_THEME_DEFAULTS",
  RESET_ALL_PREFERENCES: "RESET_ALL_PREFERENCES",
  SET_SAVING_STATUS: "SET_SAVING_STATUS",
  SAVE_HISTORY: "SAVE_HISTORY",
  UNDO: "UNDO",
  REDO: "REDO",
  SET_HISTORY: "SET_HISTORY",
  LOAD_JSON: "LOAD_JSON",
  COPY_SELECTED: "COPY_SELECTED",
  PASTE: "PASTE",
};

const getInitialTheme = () => {
  try {
    const savedTheme = sessionStorage.getItem("fsm-theme");
    return savedTheme || "system";
  } catch (error) {
    return "system";
  }
};

const getThemeDefaultColors = (theme) => {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    return {
      stateColor: "#4a90e2",
      transitionColor: "#7ed321",
      textColor: "#ffffff",
      stateTextColor: "#ffffff",
      transitionTextColor: "#ffffff",
      accentColor: "#f5a623",
    };
  } else {
    return {
      stateColor: "#007bff",
      transitionColor: "#28a745",
      textColor: "#000000",
      stateTextColor: "#000000",
      transitionTextColor: "#000000",
      accentColor: "#ffc107",
    };
  }
};

const getInitialSettings = () => {
  try {
    const theme = getInitialTheme();
    const themeDefaults = getThemeDefaultColors(theme);

    const stateStrokeWidth =
      parseInt(localStorage.getItem("fsm-stateStrokeWidth")) || 2;
    const transitionStrokeWidth =
      parseInt(localStorage.getItem("fsm-transitionStrokeWidth")) || 2;

    return {
      nodeRadius: parseInt(localStorage.getItem("fsm-nodeRadius")) || 20,
      stateColor:
        localStorage.getItem("fsm-stateColor") || themeDefaults.stateColor,
      transitionColor:
        localStorage.getItem("fsm-transitionColor") ||
        themeDefaults.transitionColor,
      stateStrokeWidth,
      transitionStrokeWidth,
      stateFilled: localStorage.getItem("fsm-stateFilled") === "true",
      gridLines: localStorage.getItem("fsm-gridLines") || "dotted",
      textColor:
        localStorage.getItem("fsm-textColor") || themeDefaults.textColor,
      textSize: parseInt(localStorage.getItem("fsm-textSize")) || 14,
      fontFamily: localStorage.getItem("fsm-fontFamily") || "Arial, sans-serif",
      stateTextColor:
        localStorage.getItem("fsm-stateTextColor") ||
        themeDefaults.stateTextColor,
      stateTextSize: parseInt(localStorage.getItem("fsm-stateTextSize")) || 14,
      transitionTextColor:
        localStorage.getItem("fsm-transitionTextColor") ||
        themeDefaults.transitionTextColor,
      transitionTextSize:
        parseInt(localStorage.getItem("fsm-transitionTextSize")) || 14,
      accentColor:
        localStorage.getItem("fsm-accentColor") || themeDefaults.accentColor,
    };
  } catch (error) {
    const themeDefaults = getThemeDefaultColors("system");
    return {
      nodeRadius: 20,
      stateColor: themeDefaults.stateColor,
      transitionColor: themeDefaults.transitionColor,
      stateStrokeWidth: 2,
      transitionStrokeWidth: 2,
      stateFilled: false,
      gridLines: "dotted",
      textColor: themeDefaults.textColor,
      textSize: 14,
      fontFamily: "Arial, sans-serif",
      stateTextColor: themeDefaults.stateTextColor,
      stateTextSize: 14,
      transitionTextColor: themeDefaults.transitionTextColor,
      transitionTextSize: 14,
      accentColor: themeDefaults.accentColor,
    };
  }
};

const initialSettings = getInitialSettings();

const getInitialHistory = () => {
  try {
    const savedHistory = sessionStorage.getItem("fsm-history");
    const savedHistoryIndex = sessionStorage.getItem("fsm-history-index");

    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      const historyIndex = savedHistoryIndex ? parseInt(savedHistoryIndex) : 0;
      return { history, historyIndex };
    }
  } catch (error) {}

  // Create initial history entry with empty state
  const initialHistoryEntry = {
    nodes: [],
    links: [],
    selectedObject: null,
    currentLink: null,
    movingObject: false,
  };

  return { history: [initialHistoryEntry], historyIndex: 0 };
};

// Get initial history
const { history: initialHistory, historyIndex: initialHistoryIndex } =
  getInitialHistory();

// Initial state
const initialState = {
  // Start with empty state for now to avoid reconstruction issues
  nodes: [],
  links: [],
  selectedObject: null,
  currentLink: null,
  movingObject: false,
  shiftPressed: false,
  altPressed: false,
  nodeRadius: initialSettings.nodeRadius,
  stateColor: initialSettings.stateColor,
  transitionColor: initialSettings.transitionColor,
  stateStrokeWidth: initialSettings.stateStrokeWidth,
  transitionStrokeWidth: initialSettings.transitionStrokeWidth,
  stateFilled: initialSettings.stateFilled,
  theme: getInitialTheme(),
  gridLines: initialSettings.gridLines,
  textColor: initialSettings.textColor,
  textSize: initialSettings.textSize,
  fontFamily: initialSettings.fontFamily,
  stateTextColor: initialSettings.stateTextColor,
  stateTextSize: initialSettings.stateTextSize,
  transitionTextColor: initialSettings.textColor, // Use textColor for transitions
  transitionTextSize: initialSettings.textSize, // Use textSize for transitions
  accentColor: initialSettings.accentColor,
  savingStatus: "idle",
  history: initialHistory,
  historyIndex: initialHistoryIndex,
  zoom: 1,
  panX: 0,
  panY: 0,
  isPanning: false,
  spacePressed: false,
  clipboard: null, // Store copied nodes and links
};

// FSM Reducer
function fsmReducer(state, action) {
  switch (action.type) {
    case FSM_ACTIONS.ADD_NODE:
      const newNodes = [...state.nodes, action.payload];
      return {
        ...state,
        nodes: newNodes,
      };

    case FSM_ACTIONS.UPDATE_NODE:
      // Update the node in place to maintain object reference
      Object.assign(action.payload.node, action.payload.updates);
      return {
        ...state,
        nodes: [...state.nodes], // Trigger re-render
      };

    case FSM_ACTIONS.DELETE_NODE:
      const filteredNodes = state.nodes.filter(
        (node) => node !== action.payload
      );
      const filteredLinks = state.links.filter(
        (link) =>
          link.node !== action.payload &&
          link.nodeA !== action.payload &&
          link.nodeB !== action.payload
      );
      return {
        ...state,
        nodes: filteredNodes,
        links: filteredLinks,
        selectedObject:
          state.selectedObject === action.payload ? null : state.selectedObject,
        currentLink:
          state.currentLink &&
          (state.currentLink.node === action.payload ||
            state.currentLink.nodeA === action.payload ||
            state.currentLink.nodeB === action.payload)
            ? null
            : state.currentLink,
      };

    case FSM_ACTIONS.ADD_LINK:
      const newLinks = [...state.links, action.payload];
      return {
        ...state,
        links: newLinks,
      };

    case FSM_ACTIONS.UPDATE_LINK:
      // Update the link in place to maintain object reference
      Object.assign(action.payload.link, action.payload.updates);
      return {
        ...state,
        links: [...state.links], // Trigger re-render
      };

    case FSM_ACTIONS.DELETE_LINK:
      const remainingLinks = state.links.filter(
        (link) => link !== action.payload
      );
      return {
        ...state,
        links: remainingLinks,
        selectedObject:
          state.selectedObject === action.payload ? null : state.selectedObject,
        currentLink:
          state.currentLink === action.payload ? null : state.currentLink,
      };

    case FSM_ACTIONS.SELECT_OBJECT:
      return {
        ...state,
        selectedObject: action.payload,
      };

    case FSM_ACTIONS.ADD_TO_SELECTION:
      const objectToAdd = action.payload;

      // If no current selection, create a new array with the object
      if (!state.selectedObject) {
        return {
          ...state,
          selectedObject: [objectToAdd],
        };
      }

      // If current selection is a single object, convert to array and add new object
      if (!Array.isArray(state.selectedObject)) {
        // Don't add the same object twice
        if (state.selectedObject === objectToAdd) {
          return state;
        }
        return {
          ...state,
          selectedObject: [state.selectedObject, objectToAdd],
        };
      }

      // If current selection is already an array, add the new object if not already present
      if (!state.selectedObject.includes(objectToAdd)) {
        return {
          ...state,
          selectedObject: [...state.selectedObject, objectToAdd],
        };
      }

      // Object already in selection, return unchanged state
      return state;

    case FSM_ACTIONS.SELECT_ALL:
      // Select all nodes only (links will automatically follow their connected nodes)
      const allNodes = [...state.nodes];
      return {
        ...state,
        selectedObject: allNodes.length > 0 ? allNodes : null,
      };

    case FSM_ACTIONS.SET_CURRENT_LINK:
      return {
        ...state,
        currentLink: action.payload,
      };

    case FSM_ACTIONS.CLEAR_CURRENT_LINK:
      return {
        ...state,
        currentLink: null,
      };

    case FSM_ACTIONS.SET_MOVING_OBJECT:
      return {
        ...state,
        movingObject: action.payload,
      };

    case FSM_ACTIONS.SET_SHIFT_PRESSED:
      return {
        ...state,
        shiftPressed: action.payload,
      };

    case FSM_ACTIONS.SET_ALT_PRESSED:
      return {
        ...state,
        altPressed: action.payload,
      };

    case FSM_ACTIONS.CLEAR_ALL:
      // Create initial empty history entry
      const emptyHistoryEntry = {
        nodes: [],
        links: [],
        selectedObject: null,
        currentLink: null,
        movingObject: false,
      };

      // Save empty history to session storage
      try {
        sessionStorage.setItem(
          "fsm-history",
          JSON.stringify([emptyHistoryEntry])
        );
        sessionStorage.setItem("fsm-history-index", "0");
      } catch (error) {}

      return {
        ...state,
        nodes: [],
        links: [],
        selectedObject: null,
        currentLink: null,
        movingObject: false,
        history: [emptyHistoryEntry],
        historyIndex: 0,
      };

    case FSM_ACTIONS.CLEAR_ALL_NODES:
      return {
        ...state,
        nodes: [],
        links: [], // Also clear links since they depend on nodes
        selectedObject: null,
        currentLink: null,
        movingObject: false,
      };

    case FSM_ACTIONS.CLEAR_ALL_LINKS:
      return {
        ...state,
        links: [],
        selectedObject:
          state.selectedObject instanceof Node ? state.selectedObject : null,
        currentLink: null,
        movingObject: false,
      };

    case FSM_ACTIONS.CREATE_NEW_DIAGRAM:
      // Create initial empty history entry for new diagram
      const newDiagramHistoryEntry = {
        nodes: [],
        links: [],
        selectedObject: null,
        currentLink: null,
        movingObject: false,
      };

      // Save empty history to session storage
      try {
        sessionStorage.setItem(
          "fsm-history",
          JSON.stringify([newDiagramHistoryEntry])
        );
        sessionStorage.setItem("fsm-history-index", "0");
      } catch (error) {}

      return {
        ...state,
        nodes: [],
        links: [],
        selectedObject: null,
        currentLink: null,
        movingObject: false,
        history: [newDiagramHistoryEntry],
        historyIndex: 0,
      };

    case FSM_ACTIONS.SET_NODE_RADIUS:
      // Save node radius to localStorage
      try {
        localStorage.setItem("fsm-nodeRadius", action.payload.toString());
      } catch (error) {}
      return {
        ...state,
        nodeRadius: action.payload,
      };

    case FSM_ACTIONS.SET_STATE_COLOR:
      // Save state color to localStorage
      try {
        localStorage.setItem("fsm-stateColor", action.payload);
      } catch (error) {}
      return {
        ...state,
        stateColor: action.payload,
      };

    case FSM_ACTIONS.SET_TRANSITION_COLOR:
      // Save transition color to localStorage
      try {
        localStorage.setItem("fsm-transitionColor", action.payload);
      } catch (error) {}
      return {
        ...state,
        transitionColor: action.payload,
      };

    case FSM_ACTIONS.SET_STATE_STROKE_WIDTH:
      // Save state stroke width to localStorage
      try {
        localStorage.setItem("fsm-stateStrokeWidth", action.payload.toString());
      } catch (error) {}
      return {
        ...state,
        stateStrokeWidth: action.payload,
      };

    case FSM_ACTIONS.SET_TRANSITION_STROKE_WIDTH:
      // Save transition stroke width to localStorage
      try {
        localStorage.setItem(
          "fsm-transitionStrokeWidth",
          action.payload.toString()
        );
      } catch (error) {}
      return {
        ...state,
        transitionStrokeWidth: action.payload,
      };

    case FSM_ACTIONS.SET_STATE_FILLED:
      // Save state filled to localStorage
      try {
        localStorage.setItem("fsm-stateFilled", action.payload.toString());
      } catch (error) {}
      return {
        ...state,
        stateFilled: action.payload,
      };

    case FSM_ACTIONS.SET_THEME:
      // Save theme to session storage
      try {
        sessionStorage.setItem("fsm-theme", action.payload);
      } catch (error) {}
      return {
        ...state,
        theme: action.payload,
      };

    case FSM_ACTIONS.SET_GRID_LINES:
      // Save grid lines to localStorage
      try {
        localStorage.setItem("fsm-gridLines", action.payload);
      } catch (error) {}
      return {
        ...state,
        gridLines: action.payload,
      };

    case FSM_ACTIONS.SET_TEXT_COLOR:
      // Save text color to localStorage
      try {
        localStorage.setItem("fsm-textColor", action.payload);
      } catch (error) {}
      return {
        ...state,
        textColor: action.payload,
      };

    case FSM_ACTIONS.SET_TEXT_SIZE:
      // Save text size to localStorage
      try {
        localStorage.setItem("fsm-textSize", action.payload.toString());
      } catch (error) {}
      return {
        ...state,
        textSize: action.payload,
      };

    case FSM_ACTIONS.SET_FONT_FAMILY:
      // Save font family to localStorage
      try {
        localStorage.setItem("fsm-fontFamily", action.payload);
      } catch (error) {}
      return {
        ...state,
        fontFamily: action.payload,
      };

    case FSM_ACTIONS.SET_STATE_TEXT_COLOR:
      // Save state text color to localStorage
      try {
        localStorage.setItem("fsm-stateTextColor", action.payload);
      } catch (error) {}
      return {
        ...state,
        stateTextColor: action.payload,
      };

    case FSM_ACTIONS.SET_TRANSITION_TEXT_COLOR:
      // Save transition text color to localStorage
      try {
        localStorage.setItem("fsm-transitionTextColor", action.payload);
      } catch (error) {}
      return {
        ...state,
        transitionTextColor: action.payload,
      };

    case FSM_ACTIONS.SET_TRANSITION_TEXT_SIZE:
      // Save transition text size to localStorage
      try {
        localStorage.setItem(
          "fsm-transitionTextSize",
          action.payload.toString()
        );
      } catch (error) {}
      return {
        ...state,
        transitionTextSize: action.payload,
      };

    case FSM_ACTIONS.SET_STATE_TEXT_SIZE:
      // Save state text size to localStorage
      try {
        localStorage.setItem("fsm-stateTextSize", action.payload.toString());
      } catch (error) {
        console.warn("Failed to save state text size to localStorage:", error);
      }
      return {
        ...state,
        stateTextSize: action.payload,
      };

    case FSM_ACTIONS.SET_ACCENT_COLOR:
      // Save accent color to localStorage
      try {
        localStorage.setItem("fsm-accentColor", action.payload);
      } catch (error) {}
      return {
        ...state,
        accentColor: action.payload,
      };

    case FSM_ACTIONS.SET_ZOOM:
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(5, action.payload)), // Limit zoom between 0.1x and 5x
      };

    case FSM_ACTIONS.SET_PAN:
      return {
        ...state,
        panX: action.payload.x,
        panY: action.payload.y,
      };

    case FSM_ACTIONS.SET_PANNING:
      return {
        ...state,
        isPanning: action.payload,
      };

    case FSM_ACTIONS.SET_SPACE_PRESSED:
      return {
        ...state,
        spacePressed: action.payload,
      };

    case FSM_ACTIONS.RESET_ZOOM:
      return {
        ...state,
        zoom: 1,
        panX: 0,
        panY: 0,
      };

    case FSM_ACTIONS.RESET_TO_THEME_DEFAULTS:
      // Reset colors to theme-based defaults
      const themeDefaults = getThemeDefaultColors(state.theme);
      try {
        localStorage.setItem("fsm-stateColor", themeDefaults.stateColor);
        localStorage.setItem(
          "fsm-transitionColor",
          themeDefaults.transitionColor
        );
        localStorage.setItem("fsm-textColor", themeDefaults.textColor);
        localStorage.setItem(
          "fsm-stateTextColor",
          themeDefaults.stateTextColor
        );
        localStorage.setItem(
          "fsm-transitionTextColor",
          themeDefaults.transitionTextColor
        );
        localStorage.setItem("fsm-accentColor", themeDefaults.accentColor);
      } catch (error) {
        console.warn(
          "Failed to save theme default colors to localStorage:",
          error
        );
      }
      return {
        ...state,
        stateColor: themeDefaults.stateColor,
        transitionColor: themeDefaults.transitionColor,
        textColor: themeDefaults.textColor,
        stateTextColor: themeDefaults.stateTextColor,
        transitionTextColor: themeDefaults.transitionTextColor,
        accentColor: themeDefaults.accentColor,
      };

    case FSM_ACTIONS.RESET_ALL_PREFERENCES:
      // Reset all preferences to default values
      const allDefaults = getThemeDefaultColors(state.theme);
      try {
        // Clear all localStorage preferences
        localStorage.removeItem("fsm-nodeRadius");
        localStorage.removeItem("fsm-stateColor");
        localStorage.removeItem("fsm-transitionColor");
        localStorage.removeItem("fsm-stateStrokeWidth");
        localStorage.removeItem("fsm-transitionStrokeWidth");
        localStorage.removeItem("fsm-stateFilled");
        localStorage.removeItem("fsm-gridLines");
        localStorage.removeItem("fsm-textColor");
        localStorage.removeItem("fsm-textSize");
        localStorage.removeItem("fsm-fontFamily");
        localStorage.removeItem("fsm-stateTextColor");
        localStorage.removeItem("fsm-stateTextSize");
        localStorage.removeItem("fsm-transitionTextColor");
        localStorage.removeItem("fsm-transitionTextSize");
        localStorage.removeItem("fsm-accentColor");
      } catch (error) {
        console.warn("Failed to clear preferences from localStorage:", error);
      }
      return {
        ...state,
        nodeRadius: 20,
        stateColor: allDefaults.stateColor,
        transitionColor: allDefaults.transitionColor,
        stateStrokeWidth: 2,
        transitionStrokeWidth: 2,
        stateFilled: false,
        gridLines: "dotted",
        textColor: allDefaults.textColor,
        textSize: 14,
        fontFamily: "Arial, sans-serif",
        stateTextColor: allDefaults.stateTextColor,
        stateTextSize: 14,
        transitionTextColor: allDefaults.transitionTextColor,
        transitionTextSize: 14,
        accentColor: allDefaults.accentColor,
      };

    case FSM_ACTIONS.SAVE_HISTORY:
      // Create a snapshot of current state
      const currentState = {
        nodes: state.nodes.map((node) => ({ ...node })),
        links: state.links.map((link) => {
          // Serialize links with proper type information
          const baseLinkData = {
            id: link.id,
            text: link.text,
            color: link.color,
            textColor: link.textColor,
          };

          if (link instanceof SelfLink) {
            return {
              ...baseLinkData,
              type: "SelfLink",
              node: link.node ? { x: link.node.x, y: link.node.y } : null,
              anchorAngle: link.anchorAngle,
              loopRadius: link.loopRadius,
            };
          } else if (link instanceof StartLink) {
            return {
              ...baseLinkData,
              type: "StartLink",
              node: link.node ? { x: link.node.x, y: link.node.y } : null,
              deltaX: link.deltaX,
              deltaY: link.deltaY,
            };
          } else {
            return {
              ...baseLinkData,
              type: "Link",
              nodeA: link.nodeA ? { x: link.nodeA.x, y: link.nodeA.y } : null,
              nodeB: link.nodeB ? { x: link.nodeB.x, y: link.nodeB.y } : null,
              lineAngleAdjust: link.lineAngleAdjust,
              parallelPart: link.parallelPart,
              perpendicularPart: link.perpendicularPart,
            };
          }
        }),
        selectedObject: state.selectedObject,
        currentLink: state.currentLink,
        movingObject: state.movingObject,
      };

      // Remove any history after current index
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(currentState);

      const newIndex = newHistory.length - 1;

      // Save to session storage
      try {
        sessionStorage.setItem("fsm-history", JSON.stringify(newHistory));
        sessionStorage.setItem("fsm-history-index", newIndex.toString());
      } catch (error) {
        console.warn("Failed to save history to session storage:", error);
      }

      return {
        ...state,
        history: newHistory,
        historyIndex: newIndex,
      };

    case FSM_ACTIONS.UNDO:
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const previousState = state.history[newIndex];

        // Save current history index to session storage
        try {
          sessionStorage.setItem("fsm-history-index", newIndex.toString());
        } catch (error) {
          console.warn(
            "Failed to save history index to session storage:",
            error
          );
        }

        // Reconstruct proper FSM objects
        const reconstructedNodes = Array.isArray(previousState.nodes)
          ? previousState.nodes.map(reconstructNode)
          : [];
        const reconstructedLinks =
          Array.isArray(previousState.links) && previousState.links.length > 0
            ? previousState.links
                .map((linkData) =>
                  reconstructLink(linkData, reconstructedNodes)
                )
                .filter((link) => link !== null)
            : [];

        // Reconstruct currentLink if it exists
        let reconstructedCurrentLink = null;
        if (
          previousState.currentLink &&
          typeof previousState.currentLink === "object"
        ) {
          reconstructedCurrentLink = reconstructLink(
            previousState.currentLink,
            reconstructedNodes
          );
        }

        // Reconstruct selectedObject if it exists and is a node
        let reconstructedSelectedObject = null;
        if (
          previousState.selectedObject &&
          typeof previousState.selectedObject === "object"
        ) {
          // Check if it's a node by looking for x, y coordinates
          if (
            typeof previousState.selectedObject.x === "number" &&
            typeof previousState.selectedObject.y === "number"
          ) {
            reconstructedSelectedObject = reconstructedNodes.find(
              (n) =>
                n.x === previousState.selectedObject.x &&
                n.y === previousState.selectedObject.y
            );
          }
        }

        return {
          ...state,
          nodes: reconstructedNodes,
          links: reconstructedLinks,
          selectedObject: reconstructedSelectedObject,
          currentLink: reconstructedCurrentLink,
          movingObject: previousState.movingObject,
          historyIndex: newIndex,
        };
      }
      return state;

    case FSM_ACTIONS.REDO:
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const nextState = state.history[newIndex];

        // Save current history index to session storage
        try {
          sessionStorage.setItem("fsm-history-index", newIndex.toString());
        } catch (error) {
          console.warn(
            "Failed to save history index to session storage:",
            error
          );
        }

        // Reconstruct proper FSM objects
        const reconstructedNodes = Array.isArray(nextState.nodes)
          ? nextState.nodes.map(reconstructNode)
          : [];
        const reconstructedLinks =
          Array.isArray(nextState.links) && nextState.links.length > 0
            ? nextState.links
                .map((linkData) =>
                  reconstructLink(linkData, reconstructedNodes)
                )
                .filter((link) => link !== null)
            : [];

        // Reconstruct currentLink if it exists
        let reconstructedCurrentLink = null;
        if (
          nextState.currentLink &&
          typeof nextState.currentLink === "object"
        ) {
          reconstructedCurrentLink = reconstructLink(
            nextState.currentLink,
            reconstructedNodes
          );
        }

        // Reconstruct selectedObject if it exists and is a node
        let reconstructedSelectedObject = null;
        if (
          nextState.selectedObject &&
          typeof nextState.selectedObject === "object"
        ) {
          // Check if it's a node by looking for x, y coordinates
          if (
            typeof nextState.selectedObject.x === "number" &&
            typeof nextState.selectedObject.y === "number"
          ) {
            reconstructedSelectedObject = reconstructedNodes.find(
              (n) =>
                n.x === nextState.selectedObject.x &&
                n.y === nextState.selectedObject.y
            );
          }
        }

        return {
          ...state,
          nodes: reconstructedNodes,
          links: reconstructedLinks,
          selectedObject: reconstructedSelectedObject,
          currentLink: reconstructedCurrentLink,
          movingObject: nextState.movingObject,
          historyIndex: newIndex,
        };
      }
      return state;

    case FSM_ACTIONS.SET_HISTORY:
      // Save to session storage
      try {
        sessionStorage.setItem(
          "fsm-history",
          JSON.stringify(action.payload.history)
        );
        sessionStorage.setItem(
          "fsm-history-index",
          action.payload.historyIndex.toString()
        );
      } catch (error) {
        console.warn("Failed to save history to session storage:", error);
      }

      return {
        ...state,
        history: action.payload.history,
        historyIndex: action.payload.historyIndex,
      };

    case FSM_ACTIONS.LOAD_JSON:
      try {
        const {
          nodes: jsonNodes,
          links: jsonLinks,
          stateFilled,
          stateColor,
          transitionColor,
          stateTextColor,
          transitionTextColor,
          nodeRadius,
          ...otherProps
        } = action.payload;

        // Reconstruct nodes as proper class instances
        const reconstructedNodes = (jsonNodes || []).map((nodeData) => {
          const node = new Node(nodeData.x, nodeData.y);
          // Copy all properties from the saved data
          Object.assign(node, nodeData);
          return node;
        });

        // Reconstruct links as proper class instances
        const reconstructedLinks = (jsonLinks || [])
          .map((linkData) => {
            let link;

            // Create the appropriate link type based on the saved data
            if (linkData.type === "SelfLink") {
              // Find the node this self-link belongs to
              const node = reconstructedNodes.find(
                (n) => n.id === linkData.node?.id
              );
              if (node) {
                link = new SelfLink(node, { x: node.x, y: node.y });
              } else {
                // Fallback: create with first available node
                const fallbackNode = reconstructedNodes[0];
                if (fallbackNode) {
                  link = new SelfLink(fallbackNode, {
                    x: fallbackNode.x,
                    y: fallbackNode.y,
                  });
                }
              }
            } else if (linkData.type === "StartLink") {
              // Find the node this start-link belongs to
              const node = reconstructedNodes.find(
                (n) => n.id === linkData.node?.id
              );
              if (node) {
                link = new StartLink(node, null);
              } else {
                // Fallback: create with first available node
                const fallbackNode = reconstructedNodes[0];
                if (fallbackNode) {
                  link = new StartLink(fallbackNode, null);
                }
              }
            } else if (linkData.type === "StandaloneArrow") {
              link = new StandaloneArrow(
                linkData.startX,
                linkData.startY,
                linkData.endX,
                linkData.endY
              );
            } else {
              // Regular Link or fallback for unknown types
              const nodeA = reconstructedNodes.find(
                (n) => n.id === linkData.nodeA?.id
              );
              const nodeB = reconstructedNodes.find(
                (n) => n.id === linkData.nodeB?.id
              );

              if (nodeA && nodeB) {
                link = new Link(nodeA, nodeB);
              } else if (linkData.nodeA === null && linkData.nodeB === null) {
                // This might be a self-link without proper type
                const fallbackNode = reconstructedNodes[0];
                if (fallbackNode) {
                  link = new SelfLink(fallbackNode, {
                    x: fallbackNode.x,
                    y: fallbackNode.y,
                  });
                }
              }
            }

            if (link) {
              // Copy properties from the saved data, but preserve node references
              const { nodeA, nodeB, node, ...otherProperties } = linkData;
              Object.assign(link, otherProperties);
            }

            return link;
          })
          .filter((link) => link !== undefined);

        // Create a new history entry with the reconstructed data
        const newHistoryEntry = {
          nodes: reconstructedNodes,
          links: reconstructedLinks,
          timestamp: new Date().toISOString(),
        };

        // Save to session storage
        try {
          sessionStorage.setItem(
            "fsm-history",
            JSON.stringify([newHistoryEntry])
          );
          sessionStorage.setItem("fsm-history-index", "0");
        } catch (error) {
          console.warn("Failed to save loaded data to session storage:", error);
        }

        return {
          ...state,
          nodes: reconstructedNodes,
          links: reconstructedLinks,
          selectedObject: null,
          currentLink: null,
          movingObject: false,
          history: [newHistoryEntry],
          historyIndex: 0,
          // Preserve styling properties from loaded data
          stateFilled:
            stateFilled !== undefined ? stateFilled : state.stateFilled,
          stateColor: stateColor || state.stateColor,
          transitionColor: transitionColor || state.transitionColor,
          stateTextColor: stateTextColor || state.stateTextColor,
          transitionTextColor: transitionTextColor || state.transitionTextColor,
          nodeRadius: nodeRadius || state.nodeRadius,
        };
      } catch (error) {
        console.error("Error loading JSON data:", error);
        console.error("Payload that caused error:", action.payload);
        // Return state with empty nodes and links to prevent crashes
        return {
          ...state,
          nodes: [],
          links: [],
          selectedObject: null,
          currentLink: null,
          movingObject: false,
          history: [
            {
              nodes: [],
              links: [],
              timestamp: new Date().toISOString(),
            },
          ],
          historyIndex: 0,
        };
      }

    case FSM_ACTIONS.SET_SAVING_STATUS:
      return {
        ...state,
        savingStatus: action.payload,
      };

    case FSM_ACTIONS.COPY_SELECTED:
      if (state.selectedObject) {
        // Handle both single object and multiple object selection
        if (Array.isArray(state.selectedObject)) {
          // Copy multiple objects to clipboard
          const clipboardData = {
            type: "multiple",
            data: state.selectedObject.map((obj) => ({
              ...obj,
              // Create a deep copy to avoid reference issues
              id: `${obj.id}_copy_${Date.now()}`,
            })),
          };

          return {
            ...state,
            clipboard: clipboardData,
          };
        } else {
          // Copy single object to clipboard
          const clipboardData = {
            type: state.selectedObject instanceof Node ? "node" : "link",
            data: {
              ...state.selectedObject,
              // Create a deep copy to avoid reference issues
              id: `${state.selectedObject.id}_copy_${Date.now()}`,
            },
          };

          return {
            ...state,
            clipboard: clipboardData,
          };
        }
      }
      return state;

    case FSM_ACTIONS.PASTE:
      if (state.clipboard) {
        const { type, data } = state.clipboard;

        if (type === "multiple") {
          // Paste multiple objects
          const newObjects = [];
          const newNodes = [...state.nodes];
          const newLinks = [...state.links];

          data.forEach((objData) => {
            if (objData.x !== undefined && objData.y !== undefined) {
              // This is a node
              const newNode = new Node(objData.x + 20, objData.y + 20);
              newNode.id = objData.id;
              newNode.text = objData.text;
              newNode.isAcceptState = objData.isAcceptState;
              newNode.radius = objData.radius;
              newNode.color = objData.color;
              newNode.textColor = objData.textColor;

              newNodes.push(newNode);
              newObjects.push(newNode);
            }
            // For now, skip pasting links as they require node references
          });

          return {
            ...state,
            nodes: newNodes,
            links: newLinks,
            selectedObject:
              newObjects.length > 1 ? newObjects : newObjects[0] || null,
          };
        } else if (type === "node") {
          // Create a new node with offset position
          const newNode = new Node(data.x + 20, data.y + 20);
          newNode.id = data.id;
          newNode.text = data.text;
          newNode.isAcceptState = data.isAcceptState;
          newNode.radius = data.radius;
          newNode.color = data.color;
          newNode.textColor = data.textColor;

          return {
            ...state,
            nodes: [...state.nodes, newNode],
            selectedObject: newNode,
          };
        } else if (type === "link") {
          // For links, we need to find the corresponding nodes
          // This is more complex as we need to handle node references
          // For now, we'll skip pasting links and focus on nodes
          return state;
        }
      }
      return state;

    default:
      return state;
  }
}

// FSM Provider Component
export function FSMProvider({ children }) {
  const [state, dispatch] = useReducer(fsmReducer, initialState);
  const canvasRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isContextReady, setIsContextReady] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const saveHistoryTimeoutRef = useRef(null);
  const saveCanvasTimeoutRef = useRef(null);
  const [diagramName, setDiagramName] = useState("Untitled Diagram");
  const [diagramType, setDiagramType] = useState("DFA");
  const [diagramAccentColor, setDiagramAccentColor] = useState("#36454f");
  const [diagramCanvasSize, setDiagramCanvasSize] = useState("medium");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentDiagramId, setCurrentDiagramId] = useState(null);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "warning",
    onConfirm: null,
  });

  // Set context as ready after initial setup
  useEffect(() => {
    setIsContextReady(true);
  }, []);

  // Load canvas data from IndexedDB on initialization
  useEffect(() => {
    const loadCanvasData = async () => {
      try {
        // Check if IndexedDB is supported

        // Ensure indexedDBManager is properly initialized
        if (!indexedDBManager) {
          console.error("indexedDBManager is not initialized");
          setIsInitialized(true);
          return;
        }

        try {
          if (!indexedDBManager.isSupported()) {
            console.warn("IndexedDB is not supported in this browser");
            setIsInitialized(true);
            return;
          }
        } catch (error) {
          console.error("Error checking IndexedDB support:", error);
          setIsInitialized(true);
          return;
        }

        // Get the current diagram ID from localStorage
        const savedDiagramId = localStorage.getItem("fsm-current-diagram-id");

        // Let's also check what diagrams are available in IndexedDB
        try {
          const allDiagrams = await indexedDBManager.getAllDiagrams();
        } catch (error) {
          console.error("Failed to get all diagrams:", error);
        }

        // Load canvas data from IndexedDB - use specific ID if available
        const savedData = await indexedDBManager.loadCanvasData(savedDiagramId);

        if (savedData) {
          // Extract diagram metadata
          const {
            id,
            name,
            type,
            accentColor,
            canvasSize,
            lastSaved,
            createdAt,
            ...canvasData
          } = savedData;

          // Set diagram metadata if they exist
          if (id) {
            setCurrentDiagramId(id);
            // Save the current diagram ID to localStorage
            localStorage.setItem("fsm-current-diagram-id", id.toString());

            // If we loaded a different diagram than requested, update the saved ID
            if (savedDiagramId && savedDiagramId !== id.toString()) {
            }
          }
          if (name) {
            setDiagramName(name);
          }
          if (type) {
            setDiagramType(type);
          }
          if (accentColor) {
            setDiagramAccentColor(accentColor);
          }
          if (canvasSize) {
            setDiagramCanvasSize(canvasSize);
          }

          // Always load canvas data, even if empty (to preserve settings and metadata)
          // Ensure we have valid data structure before loading
          const safeCanvasData = {
            nodes: canvasData.nodes || [],
            links: canvasData.links || [],
            ...canvasData,
          };
          dispatch({ type: FSM_ACTIONS.LOAD_JSON, payload: safeCanvasData });
        } else {
          // Don't clear the saved diagram ID immediately - it might be a temporary issue
          // The ID will be cleared when user explicitly creates a new diagram
        }
      } catch (error) {
        console.error("Failed to load canvas data from IndexedDB:", error);
      } finally {
        setIsInitialized(true);
        // Add a small delay to ensure everything is properly set before allowing auto-save
        setTimeout(() => {
          setIsInitialLoadComplete(true);
        }, 500);
      }
    };

    loadCanvasData();
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveHistoryTimeoutRef.current) {
        clearTimeout(saveHistoryTimeoutRef.current);
      }
      if (saveCanvasTimeoutRef.current) {
        clearTimeout(saveCanvasTimeoutRef.current);
      }
    };
  }, []);

  // Debounced saveHistory function to prevent multiple saves in quick succession
  const debouncedSaveHistory = useCallback(() => {
    // Clear any existing timeout
    if (saveHistoryTimeoutRef.current) {
      clearTimeout(saveHistoryTimeoutRef.current);
    }

    // Set a new timeout to save history after a short delay
    saveHistoryTimeoutRef.current = setTimeout(() => {
      dispatch({ type: FSM_ACTIONS.SAVE_HISTORY });
    }, 50); // 50ms delay to batch multiple rapid calls
  }, []);

  // Debounced save canvas data to IndexedDB
  const debouncedSaveCanvas = useCallback(
    (canvasState) => {
      // Clear any existing timeout
      if (saveCanvasTimeoutRef.current) {
        clearTimeout(saveCanvasTimeoutRef.current);
      }

      // Set a new timeout to save canvas data after a short delay
      saveCanvasTimeoutRef.current = setTimeout(async () => {
        try {
          // Set saving status to "saving"
          dispatch({ type: FSM_ACTIONS.SET_SAVING_STATUS, payload: "saving" });

          // Check if IndexedDB is supported
          try {
            if (!indexedDBManager.isSupported()) {
              console.warn("IndexedDB is not supported in this browser");
              dispatch({
                type: FSM_ACTIONS.SET_SAVING_STATUS,
                payload: "error",
              });
              return;
            }
          } catch (error) {
            console.error(
              "Error checking IndexedDB support in save function:",
              error
            );
            dispatch({ type: FSM_ACTIONS.SET_SAVING_STATUS, payload: "error" });
            return;
          }

          // Prepare canvas data for saving - serialize objects properly
          const canvasData = {
            // Include styling properties
            stateFilled: canvasState.stateFilled,
            stateColor: canvasState.stateColor,
            transitionColor: canvasState.transitionColor,
            stateTextColor: canvasState.stateTextColor,
            transitionTextColor: canvasState.transitionTextColor,
            nodeRadius: canvasState.nodeRadius,
            nodes: canvasState.nodes.map((node) => ({
              id: node.id,
              x: node.x,
              y: node.y,
              text: node.text,
              isAcceptState: node.isAcceptState,
              radius: node.radius,
              color: node.color,
              textColor: node.textColor,
            })),
            links: canvasState.links.map((link) => {
              const baseData = {
                id: link.id,
                text: link.text,
                color: link.color,
                textColor: link.textColor,
              };

              if (link instanceof SelfLink) {
                return {
                  ...baseData,
                  type: "SelfLink",
                  node: link.node
                    ? { id: link.node.id, x: link.node.x, y: link.node.y }
                    : null,
                  anchorAngle: link.anchorAngle,
                  loopRadius: link.loopRadius,
                };
              } else if (link instanceof StartLink) {
                return {
                  ...baseData,
                  type: "StartLink",
                  node: link.node
                    ? { id: link.node.id, x: link.node.x, y: link.node.y }
                    : null,
                  deltaX: link.deltaX,
                  deltaY: link.deltaY,
                };
              } else if (link instanceof StandaloneArrow) {
                return {
                  ...baseData,
                  type: "StandaloneArrow",
                  startX: link.startX,
                  startY: link.startY,
                  endX: link.endX,
                  endY: link.endY,
                  lineAngleAdjust: link.lineAngleAdjust,
                  parallelPart: link.parallelPart,
                  perpendicularPart: link.perpendicularPart,
                };
              } else {
                // Regular Link
                return {
                  ...baseData,
                  type: "Link",
                  nodeA: link.nodeA
                    ? { id: link.nodeA.id, x: link.nodeA.x, y: link.nodeA.y }
                    : null,
                  nodeB: link.nodeB
                    ? { id: link.nodeB.id, x: link.nodeB.x, y: link.nodeB.y }
                    : null,
                  lineAngleAdjust: link.lineAngleAdjust,
                  parallelPart: link.parallelPart,
                  perpendicularPart: link.perpendicularPart,
                };
              }
            }),
          };

          const savedId = await indexedDBManager.saveCanvasData(
            canvasData,
            diagramName,
            diagramType,
            currentDiagramId,
            diagramAccentColor,
            diagramCanvasSize
          );

          // Update current diagram ID if this was a new diagram or if we didn't have one
          if (!currentDiagramId && savedId) {
            setCurrentDiagramId(savedId);
            // Save the new diagram ID to localStorage
            localStorage.setItem("fsm-current-diagram-id", savedId.toString());
          }

          // Set saving status to "saved"
          dispatch({ type: FSM_ACTIONS.SET_SAVING_STATUS, payload: "saved" });

          // Auto-hide the "saved" status after 3 seconds
          setTimeout(() => {
            dispatch({ type: FSM_ACTIONS.SET_SAVING_STATUS, payload: "idle" });
          }, 3000);
        } catch (error) {
          console.error("Failed to save canvas data to IndexedDB:", error);
          dispatch({ type: FSM_ACTIONS.SET_SAVING_STATUS, payload: "error" });
          // Don't auto-hide error status - let it stay until next save attempt
        }
      }, 200); // 200ms delay to batch multiple rapid changes
    },
    [
      diagramName,
      diagramType,
      diagramAccentColor,
      diagramCanvasSize,
      currentDiagramId,
    ]
  );

  // Save canvas data before page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        // Save if we have content to save (nodes or links) and initial load is complete
        if (
          isInitialLoadComplete &&
          (state.nodes.length > 0 || state.links.length > 0)
        ) {
          await debouncedSaveCanvas(state);
        }
      } catch (error) {
        console.error("Failed to save on page unload:", error);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [state, isInitialLoadComplete, debouncedSaveCanvas]);

  // Auto-save canvas data to IndexedDB when state changes
  useEffect(() => {
    // Only save if the app is initialized, initial load is complete, and we have content
    // This prevents creating new diagrams when clearing all or during initial load

    if (
      isInitialized &&
      isInitialLoadComplete &&
      currentDiagramId // Only auto-save if we have a current diagram ID
    ) {
      debouncedSaveCanvas(state);
    } else if (!isInitialLoadComplete) {
    } else if (!isInitialized) {
    } else if (!currentDiagramId) {
    }
  }, [
    state.nodes,
    state.links,
    isInitialized,
    isInitialLoadComplete,
    currentDiagramId,
    debouncedSaveCanvas,
  ]);

  // Actions object
  const actions = {
    addNode: (node) => dispatch({ type: FSM_ACTIONS.ADD_NODE, payload: node }),
    updateNode: (node, updates) =>
      dispatch({ type: FSM_ACTIONS.UPDATE_NODE, payload: { node, updates } }),
    deleteNode: (node) =>
      dispatch({ type: FSM_ACTIONS.DELETE_NODE, payload: node }),
    addLink: (link) => dispatch({ type: FSM_ACTIONS.ADD_LINK, payload: link }),
    updateLink: (link, updates) =>
      dispatch({ type: FSM_ACTIONS.UPDATE_LINK, payload: { link, updates } }),
    deleteLink: (link) =>
      dispatch({ type: FSM_ACTIONS.DELETE_LINK, payload: link }),
    selectObject: (obj) =>
      dispatch({ type: FSM_ACTIONS.SELECT_OBJECT, payload: obj }),
    addToSelection: (obj) =>
      dispatch({ type: FSM_ACTIONS.ADD_TO_SELECTION, payload: obj }),
    selectAll: () => dispatch({ type: FSM_ACTIONS.SELECT_ALL }),
    setCurrentLink: (link) =>
      dispatch({ type: FSM_ACTIONS.SET_CURRENT_LINK, payload: link }),
    clearCurrentLink: () => dispatch({ type: FSM_ACTIONS.CLEAR_CURRENT_LINK }),
    setMovingObject: (moving) =>
      dispatch({ type: FSM_ACTIONS.SET_MOVING_OBJECT, payload: moving }),
    setShiftPressed: (pressed) =>
      dispatch({ type: FSM_ACTIONS.SET_SHIFT_PRESSED, payload: pressed }),
    setAltPressed: (pressed) =>
      dispatch({ type: FSM_ACTIONS.SET_ALT_PRESSED, payload: pressed }),
    clearAll: async () => {
      // If we have a current diagram, update it to be empty instead of creating a new one
      if (currentDiagramId) {
        try {
          // Create empty canvas data
          const emptyCanvasData = {
            nodes: [],
            links: [],
          };

          // Update the existing diagram to be empty
          await indexedDBManager.saveCanvasData(
            emptyCanvasData,
            diagramName,
            diagramType,
            currentDiagramId,
            diagramAccentColor,
            diagramCanvasSize
          );
        } catch (error) {
          console.error("Failed to clear current diagram:", error);
        }
      }

      // Clear the local state
      dispatch({ type: FSM_ACTIONS.CLEAR_ALL });
      // Don't clear currentDiagramId - keep it so we can continue editing the same diagram
      // The diagram ID stays the same, so the user can continue working on the same diagram
    },
    clearAllNodes: () => dispatch({ type: FSM_ACTIONS.CLEAR_ALL_NODES }),
    clearAllLinks: () => dispatch({ type: FSM_ACTIONS.CLEAR_ALL_LINKS }),
    createNewDiagram: async () => {
      // Clear the current diagram ID when creating a new diagram
      setCurrentDiagramId(null);
      localStorage.removeItem("fsm-current-diagram-id");
      dispatch({ type: FSM_ACTIONS.CREATE_NEW_DIAGRAM });

      // Immediately save the new empty diagram to get an ID
      setTimeout(async () => {
        try {
          const savedId = await indexedDBManager.saveCanvasData({
            nodes: [],
            links: [],
            name: "Untitled",
            type: "fsm",
            accentColor: "#3b82f6",
            lastSaved: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          });

          if (savedId) {
            setCurrentDiagramId(savedId);
            localStorage.setItem("fsm-current-diagram-id", savedId.toString());
          }
        } catch (error) {
          console.error("Failed to create new diagram:", error);
        }
      }, 100); // Small delay to ensure state is cleared first
    },
    setNodeRadius: (radius) =>
      dispatch({ type: FSM_ACTIONS.SET_NODE_RADIUS, payload: radius }),
    setStateColor: (color) =>
      dispatch({ type: FSM_ACTIONS.SET_STATE_COLOR, payload: color }),
    setTransitionColor: (color) =>
      dispatch({ type: FSM_ACTIONS.SET_TRANSITION_COLOR, payload: color }),
    setStateStrokeWidth: (width) =>
      dispatch({ type: FSM_ACTIONS.SET_STATE_STROKE_WIDTH, payload: width }),
    setTransitionStrokeWidth: (width) =>
      dispatch({
        type: FSM_ACTIONS.SET_TRANSITION_STROKE_WIDTH,
        payload: width,
      }),
    setStateFilled: (filled) =>
      dispatch({ type: FSM_ACTIONS.SET_STATE_FILLED, payload: filled }),
    setTheme: (theme) =>
      dispatch({ type: FSM_ACTIONS.SET_THEME, payload: theme }),
    setGridLines: (gridLines) =>
      dispatch({ type: FSM_ACTIONS.SET_GRID_LINES, payload: gridLines }),
    setTextColor: (color) =>
      dispatch({ type: FSM_ACTIONS.SET_TEXT_COLOR, payload: color }),
    setTextSize: (size) =>
      dispatch({ type: FSM_ACTIONS.SET_TEXT_SIZE, payload: size }),
    setFontFamily: (font) =>
      dispatch({ type: FSM_ACTIONS.SET_FONT_FAMILY, payload: font }),
    setStateTextColor: (color) =>
      dispatch({ type: FSM_ACTIONS.SET_STATE_TEXT_COLOR, payload: color }),
    setStateTextSize: (size) =>
      dispatch({ type: FSM_ACTIONS.SET_STATE_TEXT_SIZE, payload: size }),
    setTransitionTextColor: (color) =>
      dispatch({ type: FSM_ACTIONS.SET_TRANSITION_TEXT_COLOR, payload: color }),
    setTransitionTextSize: (size) =>
      dispatch({ type: FSM_ACTIONS.SET_TRANSITION_TEXT_SIZE, payload: size }),
    setAccentColor: (color) =>
      dispatch({ type: FSM_ACTIONS.SET_ACCENT_COLOR, payload: color }),
    setZoom: (zoom) => dispatch({ type: FSM_ACTIONS.SET_ZOOM, payload: zoom }),
    setPan: (x, y) =>
      dispatch({ type: FSM_ACTIONS.SET_PAN, payload: { x, y } }),
    setPanning: (isPanning) =>
      dispatch({ type: FSM_ACTIONS.SET_PANNING, payload: isPanning }),
    setSpacePressed: (pressed) =>
      dispatch({ type: FSM_ACTIONS.SET_SPACE_PRESSED, payload: pressed }),
    resetZoom: () => dispatch({ type: FSM_ACTIONS.RESET_ZOOM }),
    resetToThemeDefaults: () =>
      dispatch({ type: FSM_ACTIONS.RESET_TO_THEME_DEFAULTS }),
    resetAllPreferences: () =>
      dispatch({ type: FSM_ACTIONS.RESET_ALL_PREFERENCES }),

    // History functions
    saveHistory: debouncedSaveHistory,
    undo: () => dispatch({ type: FSM_ACTIONS.UNDO }),
    redo: () => dispatch({ type: FSM_ACTIONS.REDO }),

    // Copy/Paste functions
    copySelected: () => dispatch({ type: FSM_ACTIONS.COPY_SELECTED }),
    paste: () => dispatch({ type: FSM_ACTIONS.PASTE }),

    // Export functions
    exportPNG: () => {
      if (!canvasRef.current) {
        console.error("Canvas ref is null");
        actions.showConfirmation({
          title: "Export Error",
          message: "Error: Canvas not found. Please try again.",
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
        return;
      }

      try {
        // Create a temporary canvas with transparent background
        const originalCanvas = canvasRef.current;
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");

        // Set same dimensions as original canvas
        tempCanvas.width = originalCanvas.width;
        tempCanvas.height = originalCanvas.height;

        // Don't fill background - keep it transparent
        // Copy the content from original canvas
        tempCtx.drawImage(originalCanvas, 0, 0);

        // Export the temporary canvas with transparent background
        const pngData = tempCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "fsm-diagram.png";
        link.href = pngData;
        link.click();
      } catch (error) {
        console.error("PNG export failed:", error);
        actions.showConfirmation({
          title: "Export Error",
          message: "Error exporting PNG: " + error.message,
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
      }
    },
    exportAllPNG: async () => {
      try {
        // Get all diagrams from IndexedDB
        const allDiagrams = await indexedDBManager.getAllDiagrams();

        if (allDiagrams.length === 0) {
          actions.showConfirmation({
            title: "No Diagrams",
            message: "No diagrams found to export.",
            type: "info",
            confirmText: "OK",
            cancelText: null,
            onConfirm: () => actions.hideConfirmation(),
          });
          return;
        }

        const zip = new JSZip();
        const folder = zip.folder("diagrams");

        // Export each diagram as PNG using current state styling for all diagrams
        for (const diagram of allDiagrams) {
          const fullData = await indexedDBManager.loadCanvasData(diagram.id);
          if (fullData && fullData.nodes && fullData.links) {
            // Use the existing export function to generate SVG content
            const exporter = new ExportAsSVG();
            exporter.strokeStyle = state.stateColor || "#3b82f6";

            // Draw nodes with proper fill handling using current state styling
            fullData.nodes.forEach((node) => {
              // Set fill style for this node using current state settings
              exporter.fillStyle = state.stateFilled
                ? state.stateColor || "#3b82f6"
                : "none";

              // Draw the main state circle
              exporter.arc(
                node.x,
                node.y,
                state.nodeRadius || 20,
                0,
                2 * Math.PI,
                false
              );

              // Draw accept state inner circle if needed
              if (node.isAcceptState) {
                exporter.arc(
                  node.x,
                  node.y,
                  (state.nodeRadius || 20) * 0.7,
                  0,
                  2 * Math.PI,
                  false
                );
              }

              // Draw node text
              if (node.text) {
                exporter.fillText(node.text, node.x, node.y);
              }
            });

            // First, reconstruct nodes as proper Node objects
            const reconstructedNodes = fullData.nodes.map((nodeData) => {
              const node = new Node(nodeData.x, nodeData.y);
              node.id = nodeData.id;
              node.text = nodeData.text || "";
              node.isAcceptState = nodeData.isAcceptState || false;
              node.radius = nodeData.radius;
              node.color = nodeData.color;
              node.textColor = nodeData.textColor;
              return node;
            });

            // Then reconstruct link objects using the proper Node objects
            const reconstructedLinks = fullData.links
              .map((linkData) => {
                try {
                  if (linkData.type === "Link") {
                    const nodeA =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.nodeA?.id
                      ) || linkData.nodeA;
                    const nodeB =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.nodeB?.id
                      ) || linkData.nodeB;

                    // Skip if we can't find the nodes
                    if (!nodeA || !nodeB) {
                      console.warn("Skipping link - missing nodes:", linkData);
                      return null;
                    }

                    const link = new Link(nodeA, nodeB);
                    link.text = linkData.text || "";
                    link.parallelPart = linkData.parallelPart || 0.5;
                    link.perpendicularPart = linkData.perpendicularPart || 0;
                    link.lineAngleAdjust = linkData.lineAngleAdjust || 0;
                    return link;
                  } else if (linkData.type === "SelfLink") {
                    const node =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.node?.id
                      ) || linkData.node;

                    // Skip if we can't find the node
                    if (!node) {
                      console.warn(
                        "Skipping self-link - missing node:",
                        linkData
                      );
                      return null;
                    }

                    const selfLink = new SelfLink(node);
                    selfLink.text = linkData.text || "";
                    selfLink.anchorAngle = linkData.anchorAngle || 0;
                    selfLink.loopRadius = linkData.loopRadius || 1.5;
                    return selfLink;
                  } else if (linkData.type === "StartLink") {
                    const node =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.node?.id
                      ) || linkData.node;

                    // Skip if we can't find the node
                    if (!node) {
                      console.warn(
                        "Skipping start-link - missing node:",
                        linkData
                      );
                      return null;
                    }

                    const startLink = new StartLink(node);
                    startLink.text = linkData.text || "";
                    startLink.deltaX = linkData.deltaX || 0;
                    startLink.deltaY = linkData.deltaY || 0;
                    return startLink;
                  }
                  return linkData; // Return as-is if unknown type
                } catch (error) {
                  console.warn("Error reconstructing link:", error, linkData);
                  return null;
                }
              })
              .filter((link) => link !== null); // Remove null entries

            // Draw links
            exporter.strokeStyle = state.transitionColor || "#000000";
            exporter.fillStyle = "none";
            reconstructedLinks.forEach((link) => {
              if (link.constructor.name === "Link") {
                const stuff = link.getEndPointsAndCircle(
                  fullData.nodeRadius || 20
                );
                if (stuff.hasCircle) {
                  exporter.beginPath();
                  exporter.arc(
                    stuff.circleX,
                    stuff.circleY,
                    stuff.circleRadius,
                    stuff.startAngle,
                    stuff.endAngle,
                    stuff.isReversed
                  );
                  exporter.stroke();

                  // Draw arrowhead for curved transition
                  const arrowAngle =
                    stuff.endAngle - stuff.reverseScale * (Math.PI / 2);
                  const arrowX = stuff.endX;
                  const arrowY = stuff.endY;
                  const arrowSize = 8;

                  exporter.beginPath();
                  exporter.moveTo(arrowX, arrowY);
                  exporter.lineTo(
                    arrowX -
                      arrowSize * Math.cos(arrowAngle) +
                      5 * Math.sin(arrowAngle),
                    arrowY -
                      arrowSize * Math.sin(arrowAngle) -
                      5 * Math.cos(arrowAngle)
                  );
                  exporter.lineTo(
                    arrowX -
                      arrowSize * Math.cos(arrowAngle) -
                      5 * Math.sin(arrowAngle),
                    arrowY -
                      arrowSize * Math.sin(arrowAngle) +
                      5 * Math.cos(arrowAngle)
                  );
                  exporter.strokeStyle = state.transitionColor || "#000000";
                  exporter.stroke();
                } else {
                  exporter.beginPath();
                  exporter.moveTo(stuff.startX, stuff.startY);
                  exporter.lineTo(stuff.endX, stuff.endY);
                  exporter.stroke();

                  // Draw arrowhead for straight transition
                  const angle = Math.atan2(
                    stuff.endY - stuff.startY,
                    stuff.endX - stuff.startX
                  );
                  const arrowSize = 8;

                  exporter.beginPath();
                  exporter.moveTo(stuff.endX, stuff.endY);
                  exporter.lineTo(
                    stuff.endX -
                      arrowSize * Math.cos(angle) +
                      5 * Math.sin(angle),
                    stuff.endY -
                      arrowSize * Math.sin(angle) -
                      5 * Math.cos(angle)
                  );
                  exporter.lineTo(
                    stuff.endX -
                      arrowSize * Math.cos(angle) -
                      5 * Math.sin(angle),
                    stuff.endY -
                      arrowSize * Math.sin(angle) +
                      5 * Math.cos(angle)
                  );
                  exporter.strokeStyle = state.transitionColor || "#000000";
                  exporter.stroke();
                }
                if (link.text) {
                  const textX = (stuff.startX + stuff.endX) / 2;
                  const textY = (stuff.startY + stuff.endY) / 2 - 20;
                  exporter.fillText(link.text, textX, textY);
                }
              } else if (link.constructor.name === "SelfLink") {
                const stuff = link.getEndPointsAndCircle(
                  fullData.nodeRadius || 20
                );
                exporter.beginPath();
                exporter.arc(
                  stuff.circleX,
                  stuff.circleY,
                  stuff.circleRadius,
                  stuff.startAngle,
                  stuff.endAngle,
                  false
                );
                exporter.stroke();

                // Draw arrowhead for self-loop
                const arrowAngle = stuff.endAngle + Math.PI * 0.4;
                const arrowX = stuff.endX;
                const arrowY = stuff.endY;
                const arrowSize = 8;

                exporter.beginPath();
                exporter.moveTo(arrowX, arrowY);
                exporter.lineTo(
                  arrowX -
                    arrowSize * Math.cos(arrowAngle) +
                    5 * Math.sin(arrowAngle),
                  arrowY -
                    arrowSize * Math.sin(arrowAngle) -
                    5 * Math.cos(arrowAngle)
                );
                exporter.lineTo(
                  arrowX -
                    arrowSize * Math.cos(arrowAngle) -
                    5 * Math.sin(arrowAngle),
                  arrowY -
                    arrowSize * Math.sin(arrowAngle) +
                    5 * Math.cos(arrowAngle)
                );
                exporter.fillStyle = state.transitionColor || "#000000";
                exporter.fill();

                if (link.text) {
                  const centerAngle = (stuff.startAngle + stuff.endAngle) / 2;
                  const textX =
                    stuff.circleX +
                    (stuff.circleRadius + 15) * Math.cos(centerAngle);
                  const textY =
                    stuff.circleY +
                    (stuff.circleRadius + 15) * Math.sin(centerAngle);
                  exporter.fillText(link.text, textX, textY);
                }
              } else if (link.constructor.name === "StartLink") {
                const stuff = link.getEndPoints(fullData.nodeRadius || 20);
                exporter.beginPath();
                exporter.moveTo(stuff.startX, stuff.startY);
                exporter.lineTo(stuff.endX, stuff.endY);
                exporter.stroke();

                // Draw arrowhead for start link
                const angle = Math.atan2(-link.deltaY, -link.deltaX);
                const arrowSize = 8;

                exporter.beginPath();
                exporter.moveTo(stuff.endX, stuff.endY);
                exporter.lineTo(
                  stuff.endX -
                    arrowSize * Math.cos(angle) +
                    5 * Math.sin(angle),
                  stuff.endY - arrowSize * Math.sin(angle) - 5 * Math.cos(angle)
                );
                exporter.lineTo(
                  stuff.endX -
                    arrowSize * Math.cos(angle) -
                    5 * Math.sin(angle),
                  stuff.endY - arrowSize * Math.sin(angle) + 5 * Math.cos(angle)
                );
                exporter.fillStyle = state.transitionColor || "#000000";
                exporter.fill();

                if (link.text) {
                  const textX = stuff.startX + 20;
                  const textY = stuff.startY;
                  exporter.fillText(link.text, textX, textY);
                }
              }
            });

            const svgContent = exporter.toSVG();

            // Convert SVG to PNG using canvas with transparent background
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
            const url = URL.createObjectURL(svgBlob);

            await new Promise((resolve) => {
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                // Don't fill background - keep it transparent
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                resolve();
              };
              img.src = url;
            });

            // Convert canvas to blob and add to zip
            const blob = await new Promise((resolve) =>
              canvas.toBlob(resolve, "image/png")
            );
            const filename = `${diagram.name.replace(
              /[^a-zA-Z0-9]/g,
              "_"
            )}.png`;
            folder.file(filename, blob);
          }
        }

        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = zipUrl;
        a.download = `all-diagrams-png_${
          new Date().toISOString().split("T")[0]
        }.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(zipUrl);
      } catch (error) {
        console.error("Error exporting PNG zip:", error);
        actions.showConfirmation({
          title: "Export Error",
          message: "Failed to export PNG files. Please try again.",
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
      }
    },
    exportHighResPNG: () => {
      if (!canvasRef.current) {
        console.error("Canvas ref is null");
        actions.showConfirmation({
          title: "Export Error",
          message: "Error: Canvas not found. Please try again.",
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
        return;
      }

      try {
        // Create a temporary high-resolution canvas with transparent background
        const originalCanvas = canvasRef.current;
        const scale = 2.0; // High resolution scale
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");

        // Set high-resolution dimensions
        tempCanvas.width = originalCanvas.width * scale;
        tempCanvas.height = originalCanvas.height * scale;

        // Don't fill background - keep it transparent
        // Scale up the content from original canvas
        tempCtx.scale(scale, scale);
        tempCtx.drawImage(originalCanvas, 0, 0);

        // Export the temporary high-res canvas with transparent background
        const pngData = tempCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "fsm-diagram-high-res.png";
        link.href = pngData;
        link.click();
      } catch (error) {
        console.error("High-res PNG export failed:", error);
        actions.showConfirmation({
          title: "Export Error",
          message: "Error exporting high-res PNG: " + error.message,
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
      }
    },
    exportAllHighResPNG: async () => {
      try {
        // Get all diagrams from IndexedDB
        const allDiagrams = await indexedDBManager.getAllDiagrams();

        if (allDiagrams.length === 0) {
          actions.showConfirmation({
            title: "No Diagrams",
            message: "No diagrams found to export.",
            type: "info",
            confirmText: "OK",
            cancelText: null,
            onConfirm: () => actions.hideConfirmation(),
          });
          return;
        }

        const zip = new JSZip();
        const folder = zip.folder("diagrams");

        // Export each diagram as high-res PNG
        for (const diagram of allDiagrams) {
          const fullData = await indexedDBManager.loadCanvasData(diagram.id);
          if (fullData && fullData.nodes && fullData.links) {
            // First, reconstruct nodes as proper Node objects
            const reconstructedNodes = fullData.nodes.map((nodeData) => {
              const node = new Node(nodeData.x, nodeData.y);
              node.id = nodeData.id;
              node.text = nodeData.text || "";
              node.isAcceptState = nodeData.isAcceptState || false;
              node.radius = nodeData.radius;
              node.color = nodeData.color;
              node.textColor = nodeData.textColor;
              return node;
            });

            // Then reconstruct link objects using the proper Node objects
            const reconstructedLinks = fullData.links
              .map((linkData) => {
                try {
                  if (linkData.type === "Link") {
                    const nodeA =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.nodeA?.id
                      ) || linkData.nodeA;
                    const nodeB =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.nodeB?.id
                      ) || linkData.nodeB;

                    if (!nodeA || !nodeB) {
                      console.warn("Skipping link - missing nodes:", linkData);
                      return null;
                    }

                    const link = new Link(nodeA, nodeB);
                    link.text = linkData.text || "";
                    link.color = linkData.color;
                    link.textColor = linkData.textColor;
                    return link;
                  } else if (linkData.type === "SelfLink") {
                    const node =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.node?.id
                      ) || linkData.node;

                    if (!node) {
                      console.warn(
                        "Skipping self-link - missing node:",
                        linkData
                      );
                      return null;
                    }

                    const selfLink = new SelfLink(node);
                    selfLink.text = linkData.text || "";
                    selfLink.color = linkData.color;
                    selfLink.textColor = linkData.textColor;
                    return selfLink;
                  } else if (linkData.type === "StartLink") {
                    const node =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.node?.id
                      ) || linkData.node;

                    if (!node) {
                      console.warn(
                        "Skipping start-link - missing node:",
                        linkData
                      );
                      return null;
                    }

                    const startLink = new StartLink(node);
                    startLink.text = linkData.text || "";
                    startLink.deltaX = linkData.deltaX || 0;
                    startLink.deltaY = linkData.deltaY || 0;
                    return startLink;
                  }
                  return linkData;
                } catch (error) {
                  console.warn("Error reconstructing link:", error, linkData);
                  return null;
                }
              })
              .filter((link) => link !== null);

            // Use the existing export function to generate SVG content
            const exporter = new ExportAsSVG();
            exporter.strokeStyle = state.stateColor || "#3b82f6";

            // Draw nodes with proper fill handling
            reconstructedNodes.forEach((node) => {
              // Set fill style for this node
              exporter.fillStyle = state.stateFilled
                ? state.stateColor || "#3b82f6"
                : "none";

              // Draw the main state circle
              exporter.arc(
                node.x,
                node.y,
                node.radius || 20,
                0,
                Math.PI * 2,
                false
              );

              // Draw accept state inner circle if needed
              if (node.isAcceptState) {
                exporter.arc(
                  node.x,
                  node.y,
                  (node.radius || 20) - 6,
                  0,
                  Math.PI * 2,
                  false
                );
              }

              // Draw node text
              if (node.text) {
                exporter.fillText(node.text, node.x, node.y);
              }
            });

            // Draw links with proper arrow support
            reconstructedLinks.forEach((link) => {
              if (link.constructor.name === "Link") {
                const stuff = link.getEndPointsAndCircle(
                  fullData.nodeRadius || 20
                );
                exporter.beginPath();
                if (stuff.hasCircle) {
                  exporter.arc(
                    stuff.circleX,
                    stuff.circleY,
                    stuff.circleRadius,
                    stuff.startAngle,
                    stuff.endAngle,
                    stuff.isReversed
                  );
                } else {
                  exporter.moveTo(stuff.startX, stuff.startY);
                  exporter.lineTo(stuff.endX, stuff.endY);
                }
                exporter.stroke();

                // Draw arrowhead
                const angle = Math.atan2(
                  stuff.endY - (stuff.circleY || stuff.startY),
                  stuff.endX - (stuff.circleX || stuff.startX)
                );
                const arrowLength = 15;
                const arrowAngle = Math.PI / 6;

                exporter.beginPath();
                exporter.moveTo(stuff.endX, stuff.endY);
                exporter.lineTo(
                  stuff.endX - arrowLength * Math.cos(angle - arrowAngle),
                  stuff.endY - arrowLength * Math.sin(angle - arrowAngle)
                );
                exporter.moveTo(stuff.endX, stuff.endY);
                exporter.lineTo(
                  stuff.endX - arrowLength * Math.cos(angle + arrowAngle),
                  stuff.endY - arrowLength * Math.sin(angle + arrowAngle)
                );
                exporter.strokeStyle = state.transitionColor || "#000000";
                exporter.stroke();

                if (link.text) {
                  const textX = stuff.startX + 20;
                  const textY = stuff.startY;
                  exporter.fillText(link.text, textX, textY);
                }
              } else if (link.constructor.name === "SelfLink") {
                const stuff = link.getEndPointsAndCircle(
                  fullData.nodeRadius || 20
                );
                exporter.beginPath();
                exporter.arc(
                  stuff.circleX,
                  stuff.circleY,
                  stuff.circleRadius,
                  stuff.startAngle,
                  stuff.endAngle,
                  false
                );
                exporter.stroke();

                // Draw arrowhead
                const angle = Math.atan2(
                  stuff.endY - stuff.circleY,
                  stuff.endX - stuff.circleX
                );
                const arrowLength = 15;
                const arrowAngle = Math.PI / 6;

                exporter.beginPath();
                exporter.moveTo(stuff.endX, stuff.endY);
                exporter.lineTo(
                  stuff.endX - arrowLength * Math.cos(angle - arrowAngle),
                  stuff.endY - arrowLength * Math.sin(angle - arrowAngle)
                );
                exporter.moveTo(stuff.endX, stuff.endY);
                exporter.lineTo(
                  stuff.endX - arrowLength * Math.cos(angle + arrowAngle),
                  stuff.endY - arrowLength * Math.sin(angle + arrowAngle)
                );
                exporter.strokeStyle = state.transitionColor || "#000000";
                exporter.stroke();

                if (link.text) {
                  const textX = stuff.startX + 20;
                  const textY = stuff.startY;
                  exporter.fillText(link.text, textX, textY);
                }
              } else if (link.constructor.name === "StartLink") {
                const stuff = link.getEndPoints(fullData.nodeRadius || 20);
                exporter.beginPath();
                exporter.moveTo(stuff.startX, stuff.startY);
                exporter.lineTo(stuff.endX, stuff.endY);
                exporter.stroke();

                // Draw arrowhead
                const angle = Math.atan2(
                  stuff.endY - stuff.startY,
                  stuff.endX - stuff.startX
                );
                const arrowLength = 15;
                const arrowAngle = Math.PI / 6;

                exporter.beginPath();
                exporter.moveTo(stuff.endX, stuff.endY);
                exporter.lineTo(
                  stuff.endX - arrowLength * Math.cos(angle - arrowAngle),
                  stuff.endY - arrowLength * Math.sin(angle - arrowAngle)
                );
                exporter.moveTo(stuff.endX, stuff.endY);
                exporter.lineTo(
                  stuff.endX - arrowLength * Math.cos(angle + arrowAngle),
                  stuff.endY - arrowLength * Math.sin(angle + arrowAngle)
                );
                exporter.strokeStyle = state.transitionColor || "#000000";
                exporter.stroke();

                if (link.text) {
                  const textX = stuff.startX + 20;
                  const textY = stuff.startY;
                  exporter.fillText(link.text, textX, textY);
                }
              }
            });

            const svgContent = exporter.toSVG();

            // Convert SVG to high-res PNG using canvas with transparent background
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
            const url = URL.createObjectURL(svgBlob);

            await new Promise((resolve) => {
              img.onload = () => {
                // High resolution scale
                const scale = 2.0;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                // Scale up the content
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                resolve();
              };
              img.src = url;
            });

            // Convert canvas to blob and add to zip
            const blob = await new Promise((resolve) =>
              canvas.toBlob(resolve, "image/png")
            );
            const filename = `${diagram.name.replace(
              /[^a-zA-Z0-9]/g,
              "_"
            )}-high-res.png`;
            folder.file(filename, blob);
          }
        }

        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = zipUrl;
        a.download = `all-diagrams-high-res-png_${
          new Date().toISOString().split("T")[0]
        }.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(zipUrl);
      } catch (error) {
        console.error("Error exporting high-res PNG zip:", error);
        actions.showConfirmation({
          title: "Export Error",
          message: "Failed to export high-res PNG files. Please try again.",
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
      }
    },
    exportSVG: () => {
      if (typeof ExportUtils.saveAsSVG === "function") {
        ExportUtils.saveAsSVG(
          state.nodes,
          state.links,
          state.nodeRadius,
          state.stateColor,
          state.transitionColor,
          state.stateFilled
        );
      } else {
        console.error("saveAsSVG is not a function:", ExportUtils.saveAsSVG);
        actions.showConfirmation({
          title: "Export Error",
          message: "Export function not available. Please refresh the page.",
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
      }
    },
    exportAllSVG: async () => {
      try {
        // Get all diagrams from IndexedDB
        const allDiagrams = await indexedDBManager.getAllDiagrams();

        if (allDiagrams.length === 0) {
          actions.showConfirmation({
            title: "No Diagrams",
            message: "No diagrams found to export.",
            type: "info",
            confirmText: "OK",
            cancelText: null,
            onConfirm: () => actions.hideConfirmation(),
          });
          return;
        }

        const zip = new JSZip();
        const folder = zip.folder("diagrams");

        // Export each diagram as SVG using existing export function
        for (const diagram of allDiagrams) {
          const fullData = await indexedDBManager.loadCanvasData(diagram.id);
          if (fullData && fullData.nodes && fullData.links) {
            // Use the existing export function to generate SVG content
            const exporter = new ExportAsSVG();
            exporter.strokeStyle = state.stateColor || "#3b82f6";

            // Draw nodes with proper fill handling
            fullData.nodes.forEach((node) => {
              // Set fill style for this node
              exporter.fillStyle = state.stateFilled
                ? state.stateColor || "#3b82f6"
                : "none";

              // Draw the main state circle
              exporter.arc(
                node.x,
                node.y,
                state.nodeRadius || 20,
                0,
                2 * Math.PI,
                false
              );

              // Draw accept state inner circle if needed
              if (node.isAcceptState) {
                exporter.arc(
                  node.x,
                  node.y,
                  (state.nodeRadius || 20) * 0.7,
                  0,
                  2 * Math.PI,
                  false
                );
              }

              // Draw node text
              if (node.text) {
                exporter.fillText(node.text, node.x, node.y);
              }
            });

            // First, reconstruct nodes as proper Node objects
            const reconstructedNodes = fullData.nodes.map((nodeData) => {
              const node = new Node(nodeData.x, nodeData.y);
              node.id = nodeData.id;
              node.text = nodeData.text || "";
              node.isAcceptState = nodeData.isAcceptState || false;
              node.radius = nodeData.radius;
              node.color = nodeData.color;
              node.textColor = nodeData.textColor;
              return node;
            });

            // Then reconstruct link objects using the proper Node objects
            const reconstructedLinks = fullData.links
              .map((linkData) => {
                try {
                  if (linkData.type === "Link") {
                    const nodeA =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.nodeA?.id
                      ) || linkData.nodeA;
                    const nodeB =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.nodeB?.id
                      ) || linkData.nodeB;

                    // Skip if we can't find the nodes
                    if (!nodeA || !nodeB) {
                      console.warn("Skipping link - missing nodes:", linkData);
                      return null;
                    }

                    const link = new Link(nodeA, nodeB);
                    link.text = linkData.text || "";
                    link.parallelPart = linkData.parallelPart || 0.5;
                    link.perpendicularPart = linkData.perpendicularPart || 0;
                    link.lineAngleAdjust = linkData.lineAngleAdjust || 0;
                    return link;
                  } else if (linkData.type === "SelfLink") {
                    const node =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.node?.id
                      ) || linkData.node;

                    // Skip if we can't find the node
                    if (!node) {
                      console.warn(
                        "Skipping self-link - missing node:",
                        linkData
                      );
                      return null;
                    }

                    const selfLink = new SelfLink(node);
                    selfLink.text = linkData.text || "";
                    selfLink.anchorAngle = linkData.anchorAngle || 0;
                    selfLink.loopRadius = linkData.loopRadius || 1.5;
                    return selfLink;
                  } else if (linkData.type === "StartLink") {
                    const node =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.node?.id
                      ) || linkData.node;

                    // Skip if we can't find the node
                    if (!node) {
                      console.warn(
                        "Skipping start-link - missing node:",
                        linkData
                      );
                      return null;
                    }

                    const startLink = new StartLink(node);
                    startLink.text = linkData.text || "";
                    startLink.deltaX = linkData.deltaX || 0;
                    startLink.deltaY = linkData.deltaY || 0;
                    return startLink;
                  }
                  return linkData; // Return as-is if unknown type
                } catch (error) {
                  console.warn("Error reconstructing link:", error, linkData);
                  return null;
                }
              })
              .filter((link) => link !== null); // Remove null entries

            // Draw links
            exporter.strokeStyle = state.transitionColor || "#000000";
            exporter.fillStyle = "none";
            reconstructedLinks.forEach((link) => {
              if (link.constructor.name === "Link") {
                const stuff = link.getEndPointsAndCircle(
                  fullData.nodeRadius || 20
                );
                if (stuff.hasCircle) {
                  exporter.beginPath();
                  exporter.arc(
                    stuff.circleX,
                    stuff.circleY,
                    stuff.circleRadius,
                    stuff.startAngle,
                    stuff.endAngle,
                    stuff.isReversed
                  );
                  exporter.stroke();

                  // Draw arrowhead for curved transition
                  const arrowAngle =
                    stuff.endAngle - stuff.reverseScale * (Math.PI / 2);
                  const arrowX = stuff.endX;
                  const arrowY = stuff.endY;
                  const arrowSize = 8;

                  exporter.beginPath();
                  exporter.moveTo(arrowX, arrowY);
                  exporter.lineTo(
                    arrowX -
                      arrowSize * Math.cos(arrowAngle) +
                      5 * Math.sin(arrowAngle),
                    arrowY -
                      arrowSize * Math.sin(arrowAngle) -
                      5 * Math.cos(arrowAngle)
                  );
                  exporter.lineTo(
                    arrowX -
                      arrowSize * Math.cos(arrowAngle) -
                      5 * Math.sin(arrowAngle),
                    arrowY -
                      arrowSize * Math.sin(arrowAngle) +
                      5 * Math.cos(arrowAngle)
                  );
                  exporter.strokeStyle = state.transitionColor || "#000000";
                  exporter.stroke();
                } else {
                  exporter.beginPath();
                  exporter.moveTo(stuff.startX, stuff.startY);
                  exporter.lineTo(stuff.endX, stuff.endY);
                  exporter.stroke();

                  // Draw arrowhead for straight transition
                  const angle = Math.atan2(
                    stuff.endY - stuff.startY,
                    stuff.endX - stuff.startX
                  );
                  const arrowSize = 8;

                  exporter.beginPath();
                  exporter.moveTo(stuff.endX, stuff.endY);
                  exporter.lineTo(
                    stuff.endX -
                      arrowSize * Math.cos(angle) +
                      5 * Math.sin(angle),
                    stuff.endY -
                      arrowSize * Math.sin(angle) -
                      5 * Math.cos(angle)
                  );
                  exporter.lineTo(
                    stuff.endX -
                      arrowSize * Math.cos(angle) -
                      5 * Math.sin(angle),
                    stuff.endY -
                      arrowSize * Math.sin(angle) +
                      5 * Math.cos(angle)
                  );
                  exporter.strokeStyle = state.transitionColor || "#000000";
                  exporter.stroke();
                }
                if (link.text) {
                  const textX = (stuff.startX + stuff.endX) / 2;
                  const textY = (stuff.startY + stuff.endY) / 2 - 20;
                  exporter.fillText(link.text, textX, textY);
                }
              } else if (link.constructor.name === "SelfLink") {
                const stuff = link.getEndPointsAndCircle(
                  fullData.nodeRadius || 20
                );
                exporter.beginPath();
                exporter.arc(
                  stuff.circleX,
                  stuff.circleY,
                  stuff.circleRadius,
                  stuff.startAngle,
                  stuff.endAngle,
                  false
                );
                exporter.stroke();

                // Draw arrowhead for self-loop
                const arrowAngle = stuff.endAngle + Math.PI * 0.4;
                const arrowX = stuff.endX;
                const arrowY = stuff.endY;
                const arrowSize = 8;

                exporter.beginPath();
                exporter.moveTo(arrowX, arrowY);
                exporter.lineTo(
                  arrowX -
                    arrowSize * Math.cos(arrowAngle) +
                    5 * Math.sin(arrowAngle),
                  arrowY -
                    arrowSize * Math.sin(arrowAngle) -
                    5 * Math.cos(arrowAngle)
                );
                exporter.lineTo(
                  arrowX -
                    arrowSize * Math.cos(arrowAngle) -
                    5 * Math.sin(arrowAngle),
                  arrowY -
                    arrowSize * Math.sin(arrowAngle) +
                    5 * Math.cos(arrowAngle)
                );
                exporter.fillStyle = state.transitionColor || "#000000";
                exporter.fill();

                if (link.text) {
                  const centerAngle = (stuff.startAngle + stuff.endAngle) / 2;
                  const textX =
                    stuff.circleX +
                    (stuff.circleRadius + 15) * Math.cos(centerAngle);
                  const textY =
                    stuff.circleY +
                    (stuff.circleRadius + 15) * Math.sin(centerAngle);
                  exporter.fillText(link.text, textX, textY);
                }
              } else if (link.constructor.name === "StartLink") {
                const stuff = link.getEndPoints(fullData.nodeRadius || 20);
                exporter.beginPath();
                exporter.moveTo(stuff.startX, stuff.startY);
                exporter.lineTo(stuff.endX, stuff.endY);
                exporter.stroke();

                // Draw arrowhead for start link
                const angle = Math.atan2(-link.deltaY, -link.deltaX);
                const arrowSize = 8;

                exporter.beginPath();
                exporter.moveTo(stuff.endX, stuff.endY);
                exporter.lineTo(
                  stuff.endX -
                    arrowSize * Math.cos(angle) +
                    5 * Math.sin(angle),
                  stuff.endY - arrowSize * Math.sin(angle) - 5 * Math.cos(angle)
                );
                exporter.lineTo(
                  stuff.endX -
                    arrowSize * Math.cos(angle) -
                    5 * Math.sin(angle),
                  stuff.endY - arrowSize * Math.sin(angle) + 5 * Math.cos(angle)
                );
                exporter.fillStyle = state.transitionColor || "#000000";
                exporter.fill();

                if (link.text) {
                  const textX = stuff.startX + 20;
                  const textY = stuff.startY;
                  exporter.fillText(link.text, textX, textY);
                }
              }
            });

            const svgContent = exporter.toSVG();

            const filename = `${diagram.name.replace(
              /[^a-zA-Z0-9]/g,
              "_"
            )}.svg`;
            folder.file(filename, svgContent);
          }
        }

        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = zipUrl;
        a.download = `all-diagrams-svg_${
          new Date().toISOString().split("T")[0]
        }.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(zipUrl);
      } catch (error) {
        console.error("Error exporting SVG zip:", error);
        actions.showConfirmation({
          title: "Export Error",
          message: "Failed to export SVG files. Please try again.",
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
      }
    },
    exportLaTeX: () => {
      if (typeof ExportUtils.saveAsLaTeX === "function") {
        ExportUtils.saveAsLaTeX(
          state.nodes,
          state.links,
          state.nodeRadius,
          state.stateColor,
          state.transitionColor,
          state.stateFilled,
          "Finite State Machine",
          "FSM Designer",
          state.stateTextColor,
          state.transitionTextColor
        );
      } else {
        console.error(
          "saveAsLaTeX is not a function:",
          ExportUtils.saveAsLaTeX
        );
        actions.showConfirmation({
          title: "Export Error",
          message: "Export function not available. Please refresh the page.",
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
      }
    },
    exportAllLaTeX: async () => {
      try {
        // Get all diagrams from IndexedDB
        const allDiagrams = await indexedDBManager.getAllDiagrams();

        if (allDiagrams.length === 0) {
          actions.showConfirmation({
            title: "No Diagrams",
            message: "No diagrams found to export.",
            type: "info",
            confirmText: "OK",
            cancelText: null,
            onConfirm: () => actions.hideConfirmation(),
          });
          return;
        }

        const zip = new JSZip();
        const folder = zip.folder("diagrams");

        // Export each diagram as LaTeX using existing export function
        for (const diagram of allDiagrams) {
          const fullData = await indexedDBManager.loadCanvasData(diagram.id);
          if (fullData && fullData.nodes && fullData.links) {
            // Use the existing export function to generate LaTeX content
            const exporter = new ExportAsLaTeX();
            let texData = "";

            // Document header
            texData += "\\documentclass[12pt]{article}\n";
            texData += "\\usepackage{xcolor}\n";
            texData += "\\usepackage{tikz}\n\n";

            // Define colors
            const stateColorName = "stateColor";
            const transitionColorName = "transitionColor";
            const stateTextColorName = "stateTextColor";
            const transitionTextColorName = "transitionTextColor";

            texData += `\\definecolor{${stateColorName}}{HTML}{${(
              state.stateColor || "#3b82f6"
            ).substring(1)}}\n`;
            texData += `\\definecolor{${transitionColorName}}{HTML}{${(
              state.transitionColor || "#000000"
            ).substring(1)}}\n`;
            texData += `\\definecolor{${stateTextColorName}}{HTML}{${(
              state.stateTextColor || "#000000"
            ).substring(1)}}\n`;
            texData += `\\definecolor{${transitionTextColorName}}{HTML}{${(
              state.transitionTextColor || "#000000"
            ).substring(1)}}\n\n`;

            // Document start
            texData += "\\begin{document}\n\n";
            texData += "\\begin{center}\n";
            texData += "\\begin{tikzpicture}[scale=0.2]\n";
            texData += "\\tikzstyle{every node}+=[inner sep=0pt]\n";

            // First, reconstruct nodes as proper Node objects for LaTeX export
            const reconstructedNodes = fullData.nodes.map((nodeData) => {
              const node = new Node(nodeData.x, nodeData.y);
              node.id = nodeData.id;
              node.text = nodeData.text || "";
              node.isAcceptState = nodeData.isAcceptState || false;
              node.radius = nodeData.radius;
              node.color = nodeData.color;
              node.textColor = nodeData.textColor;
              return node;
            });

            // Draw nodes as TikZ nodes (matching individual export)
            reconstructedNodes.forEach((node, index) => {
              const x = (node.x * 0.2).toFixed(1);
              const y = (-node.y * 0.2).toFixed(1);
              const nodeName = `node${index}`;

              // Create TikZ node
              const fillOption = state.stateFilled
                ? `, fill=${stateColorName}`
                : "";
              if (node.isAcceptState) {
                // Accept state with double circle
                texData += `\\node[circle, draw=${stateColorName}${fillOption}, double, double distance=1.2pt, minimum size=40pt, text=${stateTextColorName}] (${nodeName}) at (${x},${y}) {$${
                  node.text || ""
                }$};\n`;
              } else {
                // Regular state
                texData += `\\node[circle, draw=${stateColorName}${fillOption}, minimum size=40pt, text=${stateTextColorName}] (${nodeName}) at (${x},${y}) {$${
                  node.text || ""
                }$};\n`;
              }

              // Store node reference for links
              node._tikzName = nodeName;
            });

            // Then reconstruct link objects using the proper Node objects
            const reconstructedLinks = fullData.links
              .map((linkData) => {
                try {
                  if (linkData.type === "Link") {
                    const nodeA =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.nodeA?.id
                      ) || linkData.nodeA;
                    const nodeB =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.nodeB?.id
                      ) || linkData.nodeB;

                    // Skip if we can't find the nodes
                    if (!nodeA || !nodeB) {
                      console.warn("Skipping link - missing nodes:", linkData);
                      return null;
                    }

                    const link = new Link(nodeA, nodeB);
                    link.text = linkData.text || "";
                    link.parallelPart = linkData.parallelPart || 0.5;
                    link.perpendicularPart = linkData.perpendicularPart || 0;
                    link.lineAngleAdjust = linkData.lineAngleAdjust || 0;
                    return link;
                  } else if (linkData.type === "SelfLink") {
                    const node =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.node?.id
                      ) || linkData.node;

                    // Skip if we can't find the node
                    if (!node) {
                      console.warn(
                        "Skipping self-link - missing node:",
                        linkData
                      );
                      return null;
                    }

                    const selfLink = new SelfLink(node);
                    selfLink.text = linkData.text || "";
                    selfLink.anchorAngle = linkData.anchorAngle || 0;
                    selfLink.loopRadius = linkData.loopRadius || 1.5;
                    return selfLink;
                  } else if (linkData.type === "StartLink") {
                    const node =
                      reconstructedNodes.find(
                        (n) => n.id === linkData.node?.id
                      ) || linkData.node;

                    // Skip if we can't find the node
                    if (!node) {
                      console.warn(
                        "Skipping start-link - missing node:",
                        linkData
                      );
                      return null;
                    }

                    const startLink = new StartLink(node);
                    startLink.text = linkData.text || "";
                    startLink.deltaX = linkData.deltaX || 0;
                    startLink.deltaY = linkData.deltaY || 0;
                    return startLink;
                  }
                  return linkData; // Return as-is if unknown type
                } catch (error) {
                  console.warn("Error reconstructing link:", error, linkData);
                  return null;
                }
              })
              .filter((link) => link !== null); // Remove null entries

            // Draw links with proper arrow support
            reconstructedLinks.forEach((link) => {
              if (link.constructor.name === "Link") {
                const nodeAIndex = reconstructedNodes.findIndex(
                  (n) => n === link.nodeA
                );
                const nodeBIndex = reconstructedNodes.findIndex(
                  (n) => n === link.nodeB
                );
                const nodeAName = `node${nodeAIndex}`;
                const nodeBName = `node${nodeBIndex}`;

                if (link.text) {
                  texData += `\\draw [${transitionColorName}, ->] (${nodeAName}) to [bend left=20] node [above, text=${transitionTextColorName}] {$${link.text}$} (${nodeBName});\n`;
                } else {
                  texData += `\\draw [${transitionColorName}, ->] (${nodeAName}) to [bend left=20] (${nodeBName});\n`;
                }
              } else if (link.constructor.name === "SelfLink") {
                const nodeIndex = reconstructedNodes.findIndex(
                  (n) => n === link.node
                );
                const nodeName = `node${nodeIndex}`;

                if (link.text) {
                  texData += `\\draw [${transitionColorName}, ->] (${nodeName}) to [out=45,in=135,looseness=8] node [right, text=${transitionTextColorName}] {$${link.text}$} (${nodeName});\n`;
                } else {
                  texData += `\\draw [${transitionColorName}, ->] (${nodeName}) to [out=45,in=135,looseness=8] (${nodeName});\n`;
                }
              } else if (link.constructor.name === "StartLink") {
                const nodeIndex = reconstructedNodes.findIndex(
                  (n) => n === link.node
                );
                const nodeName = `node${nodeIndex}`;
                const x = (link.node.x * 0.2).toFixed(1);
                const y = (-link.node.y * 0.2).toFixed(1);
                const startX = (parseFloat(x) - 3).toFixed(1);

                texData += `\\draw [${transitionColorName}, ->] (${startX},${y}) -- (${nodeName});\n`;
                texData += `\\draw (${startX},${y}) node [above left] {start};\n`;
              }
            });

            // Close document
            texData += "\\end{tikzpicture}\n";
            texData += "\\end{center}\n";
            texData += "\\end{document}\n";

            const latexContent = texData;

            const filename = `${diagram.name.replace(
              /[^a-zA-Z0-9]/g,
              "_"
            )}.tex`;
            folder.file(filename, latexContent);
          }
        }

        // Generate and download zip
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = zipUrl;
        a.download = `all-diagrams-latex_${
          new Date().toISOString().split("T")[0]
        }.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(zipUrl);
      } catch (error) {
        console.error("Error exporting LaTeX zip:", error);
        actions.showConfirmation({
          title: "Export Error",
          message: "Failed to export LaTeX files. Please try again.",
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
      }
    },

    // JSON functions
    loadJSON: (jsonData) =>
      dispatch({ type: FSM_ACTIONS.LOAD_JSON, payload: jsonData }),
    importAutomataJSON: async (automataJsonData) => {
      try {
        // Validate the automata-json format
        if (
          !automataJsonData.version ||
          !automataJsonData.diagrams ||
          !Array.isArray(automataJsonData.diagrams)
        ) {
          throw new Error(
            "Invalid .automata-json format. Expected version and diagrams array."
          );
        }

        // Clear existing diagrams
        await indexedDBManager.clearAllDiagrams();

        // Import each diagram from the backup
        for (let i = 0; i < automataJsonData.diagrams.length; i++) {
          const diagram = automataJsonData.diagrams[i];

          if (!diagram.nodes || !diagram.links) {
            throw new Error(
              `Diagram at index ${i}: Missing 'nodes' or 'links' array.`
            );
          }

          // Validate and process nodes - throw error if any required property is missing
          const processedNodes = diagram.nodes.map((node, nodeIndex) => {
            // Check required node properties
            if (node.id === undefined || node.id === null) {
              throw new Error(
                `Diagram ${i}, Node ${nodeIndex}: Missing required 'id' property.`
              );
            }
            if (typeof node.x !== "number") {
              throw new Error(
                `Diagram ${i}, Node ${nodeIndex}: Missing or invalid 'x' coordinate.`
              );
            }
            if (typeof node.y !== "number") {
              throw new Error(
                `Diagram ${i}, Node ${nodeIndex}: Missing or invalid 'y' coordinate.`
              );
            }
            if (node.text === undefined || node.text === null) {
              throw new Error(
                `Diagram ${i}, Node ${nodeIndex}: Missing required 'text' property.`
              );
            }
            if (typeof node.isAcceptState !== "boolean") {
              throw new Error(
                `Diagram ${i}, Node ${nodeIndex}: Missing or invalid 'isAcceptState' property.`
              );
            }
            // These properties are optional in the JSON but will be set from metadata if missing
            if (node.radius !== undefined && typeof node.radius !== "number") {
              throw new Error(
                `Diagram ${i}, Node ${nodeIndex}: Invalid 'radius' property. Must be a number.`
              );
            }
            if (node.color !== undefined && typeof node.color !== "string") {
              throw new Error(
                `Diagram ${i}, Node ${nodeIndex}: Invalid 'color' property. Must be a string.`
              );
            }
            if (
              node.textColor !== undefined &&
              typeof node.textColor !== "string"
            ) {
              throw new Error(
                `Diagram ${i}, Node ${nodeIndex}: Invalid 'textColor' property. Must be a string.`
              );
            }

            return {
              id: node.id,
              x: node.x,
              y: node.y,
              text: node.text,
              isAcceptState: node.isAcceptState,
              radius:
                node.radius !== undefined
                  ? node.radius
                  : diagram.metadata?.nodeRadius,
              color:
                node.color !== undefined
                  ? node.color
                  : diagram.metadata?.stateColor,
              textColor:
                node.textColor !== undefined
                  ? node.textColor
                  : diagram.metadata?.stateTextColor,
            };
          });

          // Validate and process links - throw error if any required property is missing
          const processedLinks = diagram.links.map((link, linkIndex) => {
            // Check required base link properties
            if (link.id === undefined || link.id === null) {
              throw new Error(
                `Diagram ${i}, Link ${linkIndex}: Missing required 'id' property.`
              );
            }
            if (link.text === undefined || link.text === null) {
              throw new Error(
                `Diagram ${i}, Link ${linkIndex}: Missing required 'text' property.`
              );
            }
            // These properties are optional in the JSON but will be set from metadata if missing
            if (link.color !== undefined && typeof link.color !== "string") {
              throw new Error(
                `Diagram ${i}, Link ${linkIndex}: Invalid 'color' property. Must be a string.`
              );
            }
            if (
              link.textColor !== undefined &&
              typeof link.textColor !== "string"
            ) {
              throw new Error(
                `Diagram ${i}, Link ${linkIndex}: Invalid 'textColor' property. Must be a string.`
              );
            }

            const baseData = {
              id: link.id,
              text: link.text,
              color:
                link.color !== undefined
                  ? link.color
                  : diagram.metadata?.transitionColor,
              textColor:
                link.textColor !== undefined
                  ? link.textColor
                  : diagram.metadata?.transitionTextColor,
            };

            if (link.type === "SelfLink") {
              if (link.node === undefined) {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: SelfLink missing required 'node' property.`
                );
              }
              if (typeof link.anchorAngle !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: SelfLink missing or invalid 'anchorAngle' property.`
                );
              }
              if (typeof link.loopRadius !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: SelfLink missing or invalid 'loopRadius' property.`
                );
              }
              return {
                ...baseData,
                type: "SelfLink",
                node: link.node,
                anchorAngle: link.anchorAngle,
                loopRadius: link.loopRadius,
              };
            } else if (link.type === "StartLink") {
              if (link.node === undefined) {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: StartLink missing required 'node' property.`
                );
              }
              if (typeof link.deltaX !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: StartLink missing or invalid 'deltaX' property.`
                );
              }
              if (typeof link.deltaY !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: StartLink missing or invalid 'deltaY' property.`
                );
              }
              return {
                ...baseData,
                type: "StartLink",
                node: link.node,
                deltaX: link.deltaX,
                deltaY: link.deltaY,
              };
            } else if (link.type === "StandaloneArrow") {
              if (typeof link.startX !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: StandaloneArrow missing or invalid 'startX' property.`
                );
              }
              if (typeof link.startY !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: StandaloneArrow missing or invalid 'startY' property.`
                );
              }
              if (typeof link.endX !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: StandaloneArrow missing or invalid 'endX' property.`
                );
              }
              if (typeof link.endY !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: StandaloneArrow missing or invalid 'endY' property.`
                );
              }
              if (typeof link.lineAngleAdjust !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: StandaloneArrow missing or invalid 'lineAngleAdjust' property.`
                );
              }
              if (typeof link.parallelPart !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: StandaloneArrow missing or invalid 'parallelPart' property.`
                );
              }
              if (typeof link.perpendicularPart !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: StandaloneArrow missing or invalid 'perpendicularPart' property.`
                );
              }
              return {
                ...baseData,
                type: "StandaloneArrow",
                startX: link.startX,
                startY: link.startY,
                endX: link.endX,
                endY: link.endY,
                lineAngleAdjust: link.lineAngleAdjust,
                parallelPart: link.parallelPart,
                perpendicularPart: link.perpendicularPart,
              };
            } else {
              // Regular Link
              if (link.nodeA === undefined) {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: Regular Link missing required 'nodeA' property.`
                );
              }
              if (link.nodeB === undefined) {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: Regular Link missing required 'nodeB' property.`
                );
              }
              if (typeof link.lineAngleAdjust !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: Regular Link missing or invalid 'lineAngleAdjust' property.`
                );
              }
              if (typeof link.parallelPart !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: Regular Link missing or invalid 'parallelPart' property.`
                );
              }
              if (typeof link.perpendicularPart !== "number") {
                throw new Error(
                  `Diagram ${i}, Link ${linkIndex}: Regular Link missing or invalid 'perpendicularPart' property.`
                );
              }
              return {
                ...baseData,
                type: "Link",
                nodeA: link.nodeA,
                nodeB: link.nodeB,
                lineAngleAdjust: link.lineAngleAdjust,
                parallelPart: link.parallelPart,
                perpendicularPart: link.perpendicularPart,
              };
            }
          });

          // Validate metadata properties
          if (diagram.metadata) {
            if (
              diagram.metadata.stateFilled !== undefined &&
              typeof diagram.metadata.stateFilled !== "boolean"
            ) {
              throw new Error(
                `Diagram ${i}: Invalid 'stateFilled' property in metadata.`
              );
            }
            if (
              diagram.metadata.stateColor !== undefined &&
              typeof diagram.metadata.stateColor !== "string"
            ) {
              throw new Error(
                `Diagram ${i}: Invalid 'stateColor' property in metadata.`
              );
            }
            if (
              diagram.metadata.transitionColor !== undefined &&
              typeof diagram.metadata.transitionColor !== "string"
            ) {
              throw new Error(
                `Diagram ${i}: Invalid 'transitionColor' property in metadata.`
              );
            }
            if (
              diagram.metadata.stateTextColor !== undefined &&
              typeof diagram.metadata.stateTextColor !== "string"
            ) {
              throw new Error(
                `Diagram ${i}: Invalid 'stateTextColor' property in metadata.`
              );
            }
            if (
              diagram.metadata.transitionTextColor !== undefined &&
              typeof diagram.metadata.transitionTextColor !== "string"
            ) {
              throw new Error(
                `Diagram ${i}: Invalid 'transitionTextColor' property in metadata.`
              );
            }
            if (
              diagram.metadata.nodeRadius !== undefined &&
              typeof diagram.metadata.nodeRadius !== "number"
            ) {
              throw new Error(
                `Diagram ${i}: Invalid 'nodeRadius' property in metadata.`
              );
            }
            if (
              diagram.metadata.canvasSize !== undefined &&
              typeof diagram.metadata.canvasSize !== "string"
            ) {
              throw new Error(
                `Diagram ${i}: Invalid 'canvasSize' property in metadata.`
              );
            }
          }

          // Create a new diagram with the imported data
          await indexedDBManager.saveCanvasData(
            {
              nodes: processedNodes,
              links: processedLinks,
              stateFilled: diagram.metadata?.stateFilled,
              stateColor: diagram.metadata?.stateColor,
              transitionColor: diagram.metadata?.transitionColor,
              stateTextColor: diagram.metadata?.stateTextColor,
              transitionTextColor: diagram.metadata?.transitionTextColor,
              nodeRadius: diagram.metadata?.nodeRadius,
              metadata: {
                canvasSize: diagram.metadata?.canvasSize,
              },
            },
            diagram.name || "Imported Diagram",
            diagram.type || "DFA",
            null // Let IndexedDB generate a new ID
          );
        }

        // Show success message
        actions.showConfirmation({
          title: "Import Successful",
          message: `Successfully imported ${automataJsonData.diagrams.length} diagrams from the backup file.`,
          type: "success",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });

        return true;
      } catch (error) {
        console.error("Error importing .automata-json:", error);
        actions.showConfirmation({
          title: "Import Error",
          message: `Failed to import .automata-json file: ${error.message}`,
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
        return false;
      }
    },
    exportJSON: async () => {
      try {
        // Get all diagrams metadata from IndexedDB
        const allDiagrams = await indexedDBManager.getAllDiagrams();

        // Get full data for each diagram
        const diagramsWithData = await Promise.all(
          allDiagrams.map(async (diagram) => {
            const fullData = await indexedDBManager.loadCanvasData(diagram.id);

            // Serialize nodes properly (same format as save function)
            const serializedNodes = (fullData?.nodes || []).map((node) => ({
              id: node.id,
              x: node.x,
              y: node.y,
              text: node.text,
              isAcceptState: node.isAcceptState,
              radius: node.radius,
              color: node.color,
              textColor: node.textColor,
            }));

            // Serialize links properly (same format as save function)
            const serializedLinks = (fullData?.links || []).map((link) => {
              const baseData = {
                id: link.id,
                text: link.text,
                color: link.color,
                textColor: link.textColor,
              };

              if (link.type === "SelfLink") {
                return {
                  ...baseData,
                  type: "SelfLink",
                  node: link.node
                    ? { id: link.node.id, x: link.node.x, y: link.node.y }
                    : null,
                  anchorAngle: link.anchorAngle,
                  loopRadius: link.loopRadius,
                };
              } else if (link.type === "StartLink") {
                return {
                  ...baseData,
                  type: "StartLink",
                  node: link.node
                    ? { id: link.node.id, x: link.node.x, y: link.node.y }
                    : null,
                  deltaX: link.deltaX,
                  deltaY: link.deltaY,
                };
              } else if (link.type === "StandaloneArrow") {
                return {
                  ...baseData,
                  type: "StandaloneArrow",
                  startX: link.startX,
                  startY: link.startY,
                  endX: link.endX,
                  endY: link.endY,
                  lineAngleAdjust: link.lineAngleAdjust,
                  parallelPart: link.parallelPart,
                  perpendicularPart: link.perpendicularPart,
                };
              } else {
                // Regular Link
                return {
                  ...baseData,
                  type: "Link",
                  nodeA: link.nodeA
                    ? { id: link.nodeA.id, x: link.nodeA.x, y: link.nodeA.y }
                    : null,
                  nodeB: link.nodeB
                    ? { id: link.nodeB.id, x: link.nodeB.x, y: link.nodeB.y }
                    : null,
                  lineAngleAdjust: link.lineAngleAdjust,
                  parallelPart: link.parallelPart,
                  perpendicularPart: link.perpendicularPart,
                };
              }
            });

            return {
              id: diagram.id,
              name: diagram.name,
              type: diagram.type,
              accentColor: diagram.accentColor,
              createdAt: diagram.createdAt,
              lastSaved: diagram.lastSaved,
              nodes: serializedNodes,
              links: serializedLinks,
              metadata: {
                name: diagram.name,
                type: diagram.type || "FSM",
                accentColor: diagram.accentColor || "#007bff",
                canvasSize: fullData?.metadata?.canvasSize || "large",
                // Include styling properties in metadata
                stateFilled: fullData?.stateFilled || false,
                stateColor: fullData?.stateColor || "#3b82f6",
                transitionColor: fullData?.transitionColor || "#6b7280",
                stateTextColor: fullData?.stateTextColor || "#ffffff",
                transitionTextColor: fullData?.transitionTextColor || "#000000",
                nodeRadius: fullData?.nodeRadius || 20,
              },
            };
          })
        );

        // Transform to export format
        const exportData = {
          version: "1.0",
          exportedAt: new Date().toISOString(),
          totalDiagrams: diagramsWithData.length,
          metadata: {
            tool: "Automata Drawing Tools - By Phal Sovandy",
            website: "https://automata-draw.com",
            credit: "Created with Automata Drawing Tools - By Phal Sovandy",
            description: "Finite State Machine and Automata diagram designer",
            version: "1.0.0",
            format: "automata-json",
          },
          diagrams: diagramsWithData,
        };

        // Create and download .automata-json file
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `all-diagrams_${
          new Date().toISOString().split("T")[0]
        }.automata-json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error exporting diagrams:", error);
        actions.showConfirmation({
          title: "Export Error",
          message: "Failed to export diagrams. Please try again.",
          type: "danger",
          confirmText: "OK",
          cancelText: null,
          onConfirm: () => actions.hideConfirmation(),
        });
      }
    },

    // IndexedDB functions
    saveCanvasToIndexedDB: () => debouncedSaveCanvas(state),
    debugIndexedDB: async () => {
      try {
        const allDiagrams = await indexedDBManager.getAllDiagrams();
        const currentId = localStorage.getItem("fsm-current-diagram-id");
        if (allDiagrams.length > 0) {
        }
        return { currentId, allDiagrams };
      } catch (error) {
        console.error("Debug IndexedDB error:", error);
        return null;
      }
    },
    clearCanvasFromIndexedDB: async () => {
      try {
        await indexedDBManager.clearAllDiagrams();
        setCurrentDiagramId(null);
      } catch (error) {
        console.error("Failed to clear diagrams from IndexedDB:", error);
      }
    },
    getAllDiagrams: async () => {
      try {
        return await indexedDBManager.getAllDiagrams();
      } catch (error) {
        console.error("Failed to get diagrams from IndexedDB:", error);
        return [];
      }
    },
    deleteDiagram: async (diagramId) => {
      try {
        await indexedDBManager.deleteDiagram(diagramId);
        // If we deleted the current diagram, reset the current diagram ID
        if (currentDiagramId === diagramId) {
          setCurrentDiagramId(null);
          localStorage.removeItem("fsm-current-diagram-id");
        }
      } catch (error) {
        console.error("Failed to delete diagram from IndexedDB:", error);
      }
    },
    loadDiagram: async (diagramId) => {
      try {
        const diagramData = await indexedDBManager.loadCanvasData(diagramId);
        if (diagramData) {
          const {
            id,
            name,
            type,
            accentColor,
            canvasSize,
            lastSaved,
            createdAt,
            ...canvasData
          } = diagramData;

          setCurrentDiagramId(id);
          // Save the loaded diagram ID to localStorage
          localStorage.setItem("fsm-current-diagram-id", id.toString());
          setDiagramName(name);
          setDiagramType(type);
          if (accentColor) setDiagramAccentColor(accentColor);
          if (canvasSize) setDiagramCanvasSize(canvasSize);
          // Ensure we have valid data structure before loading
          const safeCanvasData = {
            nodes: canvasData.nodes || [],
            links: canvasData.links || [],
            ...canvasData,
          };
          dispatch({ type: FSM_ACTIONS.LOAD_JSON, payload: safeCanvasData });
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to load diagram from IndexedDB:", error);
        return false;
      }
    },
    updateDiagramMetadata: async (diagramId, updates) => {
      try {
        return await indexedDBManager.updateDiagramMetadata(diagramId, updates);
      } catch (error) {
        console.error("Failed to update diagram metadata:", error);
        throw error;
      }
    },
    getIndexedDBInfo: async () => {
      try {
        return await indexedDBManager.getDBInfo();
      } catch (error) {
        console.error("Failed to get IndexedDB info:", error);
        return null;
      }
    },

    // Diagram metadata functions
    setDiagramName: (name) => setDiagramName(name),
    setDiagramType: (type) => setDiagramType(type),
    setDiagramAccentColor: (color) => setDiagramAccentColor(color),
    setDiagramCanvasSize: (size) => setDiagramCanvasSize(size),
    setCurrentDiagramId: (id) => {
      setCurrentDiagramId(id);
      // Save the current diagram ID to localStorage for persistence across refreshes
      if (id) {
        localStorage.setItem("fsm-current-diagram-id", id.toString());
      } else {
        localStorage.removeItem("fsm-current-diagram-id");
      }
    },

    // Sidebar functions
    toggleSidebar: () => setIsSidebarCollapsed(!isSidebarCollapsed),

    // Confirmation modal functions
    showConfirmation: (config) => {
      setConfirmationModal({
        isOpen: true,
        title: config.title || "Confirm Action",
        message: config.message || "Are you sure?",
        confirmText: config.confirmText || "Confirm",
        cancelText: config.cancelText || "Cancel",
        type: config.type || "warning",
        onConfirm: config.onConfirm || (() => {}),
      });
    },
    hideConfirmation: () => {
      setConfirmationModal({
        isOpen: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        type: "warning",
        onConfirm: null,
      });
    },
  };

  return (
    <FSMContext.Provider
      value={{
        state,
        dispatch,
        actions,
        canvasRef,
        isInitialized,
        isContextReady,
        diagramName,
        diagramType,
        diagramAccentColor,
        diagramCanvasSize,
        isSidebarCollapsed,
        currentDiagramId,
        confirmationModal,
        transitionTextColor: state.transitionTextColor,
        transitionTextSize: state.transitionTextSize,
      }}
    >
      {isContextReady ? children : <div>Loading...</div>}
    </FSMContext.Provider>
  );
}

// Custom hook to use FSM context
export function useFSM() {
  const context = useContext(FSMContext);
  if (!context) {
    console.error("useFSM hook called outside of FSMProvider");
    throw new Error("useFSM must be used within a FSMProvider");
  }

  const {
    state,
    actions,
    canvasRef,
    isInitialized,
    diagramName,
    diagramType,
    diagramAccentColor,
    diagramCanvasSize,
    isSidebarCollapsed,
    currentDiagramId,
    confirmationModal,
  } = context;

  return {
    // State
    ...state,
    // Actions
    ...actions,
    actions, // Also return the actions object itself
    // Other context values
    canvasRef,
    isInitialized,
    diagramName,
    diagramType,
    diagramAccentColor,
    diagramCanvasSize,
    isSidebarCollapsed,
    currentDiagramId,
    confirmationModal,
  };
}

export { FSM_ACTIONS };
