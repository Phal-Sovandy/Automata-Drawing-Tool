import React, { useRef, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useFSM } from "../context/FSMContext.jsx";
import {
  Node,
  Link,
  SelfLink,
  StartLink,
  TemporaryLink,
  StandaloneArrow,
} from "../utils/FSMClasses.jsx";
import { SHORTCUTS } from "../utils/shortcuts.js";
import OperationAlerts from "./ui/OperationAlerts.jsx";
import CanvasWalkthroughModal from "./modals/CanvasWalkthroughModal.jsx";
import { Tooltip } from "react-tooltip";

const Canvas = ({ resolvedTheme }) => {
  const containerRef = useRef(null);
  const {
    nodes,
    links,
    selectedObject,
    currentLink,
    movingObject,
    shiftPressed,
    altPressed,
    nodeRadius,
    stateColor,
    transitionColor,
    stateStrokeWidth,
    transitionStrokeWidth,
    stateFilled,
    gridLines,
    addNode,
    addLink,
    isSidebarCollapsed,
    toggleSidebar,
    selectObject,
    addToSelection,
    setCurrentLink,
    clearCurrentLink,
    setMovingObject,
    setShiftPressed,
    setAltPressed,
    updateNode,
    deleteNode,
    deleteLink,
    saveHistory,
    undo,
    zoom,
    panX,
    panY,
    isPanning,
    spacePressed,
    setZoom,
    setPan,
    setPanning,
    setSpacePressed,
    resetZoom,
    redo,
    copySelected,
    paste,
    accentColor,
    textColor,
    textSize,
    fontFamily,
    stateTextColor,
    stateTextSize,
    transitionTextColor,
    transitionTextSize,
    diagramCanvasSize,
    canvasRef,
  } = useFSM();

  // State to track which node is being snapped to
  const [snappedNode, setSnappedNode] = useState(null);

  // State to track which handle is being dragged on standalone arrows
  const [draggedHandle, setDraggedHandle] = useState(null);

  const [canvasWalkthroughOpen, setCanvasWalkthroughOpen] = useState(false);

  useEffect(() => {
    if (nodes.length === 0) {
      const hasSeenCanvasWalkthrough = localStorage.getItem(
        "canvas-walkthrough-shown"
      );
      if (!hasSeenCanvasWalkthrough) {
        setCanvasWalkthroughOpen(true);
      }
    }
  }, [nodes.length]);

  const SNAP_TO_PADDING = 6;
  const HIT_TARGET_PADDING = 6;

  const pixelPerfect = (value) => Math.round(value) + 0.5;

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    const computedStyle = window.getComputedStyle(canvas);
    const canvasWidth = parseFloat(computedStyle.width);
    const canvasHeight = parseFloat(computedStyle.height);

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.textRenderingOptimization = "optimizeSpeed";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    draw();
  }, []);

  const drawGridLines = useCallback(
    (c, width, height) => {
      if (gridLines === "none") return;

      c.save();
      c.fillStyle = resolvedTheme === "dark" ? "#2a2a2a" : "#c0c0c0";
      c.strokeStyle = resolvedTheme === "dark" ? "#2a2a2a" : "#e0e0e0";
      c.lineWidth = 1;

      const gridSize = 20; // Grid spacing

      if (gridLines === "dotted" && resolvedTheme === "dark") {
        for (let x = 0; x <= width; x += gridSize) {
          for (let y = 0; y <= height; y += gridSize) {
            c.beginPath();
            c.arc(pixelPerfect(x), pixelPerfect(y), 2, 0, 2 * Math.PI);
            c.fill();
          }
        }
      } else if (gridLines === "grid") {
        // Draw only solid grid lines
        c.setLineDash([]); // Solid line pattern for grid

        // Draw vertical lines with pixel-perfect positioning
        for (let x = 0; x <= width; x += gridSize) {
          c.beginPath();
          c.moveTo(pixelPerfect(x), 0);
          c.lineTo(pixelPerfect(x), height);
          c.stroke();
        }

        // Draw horizontal lines with pixel-perfect positioning
        for (let y = 0; y <= height; y += gridSize) {
          c.beginPath();
          c.moveTo(0, pixelPerfect(y));
          c.lineTo(width, pixelPerfect(y));
          c.stroke();
        }
      }

      c.restore();
    },
    [resolvedTheme, gridLines]
  );

  // Draw function
  // Helper function to get mouse coordinates relative to the canvas
  const getMouseCoordinates = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const canvasX = screenX / zoom;
      const canvasY = screenY / zoom;

      return {
        x: canvasX,
        y: canvasY,
      };
    },
    [panX, panY, zoom]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const c = canvas.getContext("2d");

    // Use the canvas's actual dimensions
    const displayWidth = canvas.width / (window.devicePixelRatio || 1);
    const displayHeight = canvas.height / (window.devicePixelRatio || 1);

    // Set background color based on theme
    if (resolvedTheme === "dark") {
      c.fillStyle = "#1e1e1e";
      c.fillRect(0, 0, displayWidth, displayHeight);
    } else {
      c.clearRect(0, 0, displayWidth, displayHeight);
    }

    c.save();

    // Draw grid lines
    if (gridLines === "grid" || gridLines === "dotted") {
      drawGridLines(c, displayWidth, displayHeight);
    }

    // Draw nodes
    nodes.forEach((node) => {
      c.lineWidth = stateStrokeWidth;
      if (
        node === selectedObject ||
        (Array.isArray(selectedObject) && selectedObject.includes(node))
      ) {
        c.fillStyle = stateFilled ? stateColor : "transparent";
        c.strokeStyle = accentColor;
        c.lineWidth = stateStrokeWidth + 2; // Thicker border for selected node
      } else if (node === snappedNode) {
        c.fillStyle = stateFilled ? stateColor : "transparent";
        c.strokeStyle = "#10b981"; // Green color for snapped node
        c.lineWidth = stateStrokeWidth + 1; // Thicker border for snapped node
      } else {
        c.fillStyle = stateFilled ? stateColor : "transparent";
        c.strokeStyle = stateColor;
      }
      node.draw(c, nodeRadius, selectedObject, {
        textColor,
        textSize,
        fontFamily,
        stateTextColor,
        stateTextSize,
      });
    });

    // Draw links
    links.forEach((link, index) => {
      c.lineWidth = transitionStrokeWidth;
      c.fillStyle = c.strokeStyle =
        link === selectedObject ||
        (Array.isArray(selectedObject) && selectedObject.includes(link))
          ? accentColor
          : transitionColor;
      try {
        link.draw(c, nodeRadius, selectedObject, {
          textColor: transitionTextColor,
          textSize: transitionTextSize,
          fontFamily,
          stateTextColor,
          stateTextSize,
        });
      } catch (error) {
        console.error(`Canvas: Error drawing link ${index}:`, error);
      }
    });

    // Draw current link
    if (currentLink) {
      c.lineWidth = transitionStrokeWidth;
      c.fillStyle = c.strokeStyle = transitionColor;
      currentLink.draw(c);
    }

    c.restore();
  }, [
    nodes,
    links,
    selectedObject,
    currentLink,
    nodeRadius,
    snappedNode,
    stateColor,
    transitionColor,
    stateStrokeWidth,
    transitionStrokeWidth,
    stateFilled,
    gridLines,
    resolvedTheme,
    drawGridLines,
    pixelPerfect,
    accentColor,
    textColor,
    textSize,
    fontFamily,
    stateTextColor,
    stateTextSize,
    transitionTextColor,
    transitionTextSize,
  ]);

  // Select object at point
  const selectObjectAtPoint = useCallback(
    (x, y) => {
      // Check nodes first
      for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].containsPoint(x, y, nodeRadius)) {
          return nodes[i];
        }
      }

      // Check links
      for (let i = links.length - 1; i >= 0; i--) {
        if (links[i].containsPoint(x, y, nodeRadius, HIT_TARGET_PADDING)) {
          return links[i];
        }
      }

      return null;
    },
    [nodes, links, nodeRadius]
  );

  // Snap node to other nodes
  const snapNode = useCallback(
    (node) => {
      nodes.forEach((otherNode) => {
        if (otherNode === node) return;

        const xDiff = Math.abs(node.x - otherNode.x);
        const yDiff = Math.abs(node.y - otherNode.y);

        if (xDiff < SNAP_TO_PADDING) {
          node.x = otherNode.x;
        }

        if (yDiff < SNAP_TO_PADDING) {
          node.y = otherNode.y;
        }
      });
    },
    [nodes]
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e) => {
      // For panning, use screen coordinates - this works anywhere in the container
      if (e.button === 1 || (e.button === 0 && spacePressed)) {
        setPanning(true);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Focus the canvas to enable keyboard input
      canvas.focus();

      // For object selection, use transformed coordinates
      const { x, y } = getMouseCoordinates(e);
      const clickedObject = selectObjectAtPoint(x, y);

      // Check if we're clicking on any link/self-link/standalone arrow/start link for direct dragging
      if (
        clickedObject &&
        (clickedObject instanceof StandaloneArrow ||
          clickedObject instanceof SelfLink ||
          clickedObject instanceof Link ||
          clickedObject instanceof StartLink)
      ) {
        // Select the link and start direct dragging
        selectObject(clickedObject);
        setDraggedHandle("direct");
        return; // Don't process other selection logic
      }

      // Check if we're clicking on an already selected object (for multi-selection movement)
      const isClickingOnSelectedObject =
        clickedObject &&
        ((Array.isArray(selectedObject) &&
          selectedObject.some((obj) => obj.id === clickedObject.id)) ||
          (selectedObject &&
            !Array.isArray(selectedObject) &&
            selectedObject.id === clickedObject.id));

      // Handle selection based on modifier keys and current selection state

      if ((altPressed || e.altKey) && clickedObject) {
        // Alt+click: add to selection
        addToSelection(clickedObject);
      } else if (Array.isArray(selectedObject) && selectedObject.length > 1) {
        // If we have multiple objects selected
        if (clickedObject && !isClickingOnSelectedObject) {
          // Clicking on an unselected object: select just that object
          selectObject(clickedObject);
        } else if (clickedObject && isClickingOnSelectedObject) {
          // Clicking on a selected object: keep current selection and move all
          // Don't change selection, just proceed with movement logic
        } else {
          // Clicking on empty area: deselect all
          selectObject(null);
        }
      } else if (isClickingOnSelectedObject) {
        // Clicking on already selected single object: keep current selection
        // Don't change selection, just proceed with movement logic
      } else {
        // Regular click: replace selection
        selectObject(clickedObject);
      }
      setDraggedHandle(null); // Clear any handle dragging

      // Object creation/modification

      if (clickedObject) {
        if (shiftPressed && clickedObject instanceof Node) {
          // Start creating self-link
          const selfLink = new SelfLink(clickedObject, { x, y });
          setCurrentLink(selfLink);
        } else {
          // Start moving object(s)
          setMovingObject(true);

          // Determine what objects to move based on selection state
          const shouldMoveAll =
            (Array.isArray(selectedObject) && selectedObject.length > 1) || // Multi-selection
            isClickingOnSelectedObject || // Clicking on already selected object
            ((altPressed || e.altKey) && clickedObject); // Alt+click to add to selection

          if (shouldMoveAll) {
            // Set mouse start for all selected objects
            const objectsToMove = Array.isArray(selectedObject)
              ? selectedObject
              : selectedObject
              ? [selectedObject]
              : [];

            // If we used alt+click, the clicked object will be added to selection by addToSelection
            // So we need to include it in the movement
            if ((altPressed || e.altKey) && clickedObject) {
              // The addToSelection will be called, so we need to include the clicked object
              if (
                !objectsToMove.some((obj) => obj && obj.id === clickedObject.id)
              ) {
                objectsToMove.push(clickedObject);
              }
            }

            objectsToMove.forEach((obj) => {
              if (obj && obj instanceof Node && obj.setMouseStart) {
                obj.setMouseStart(x, y);
              }
            });
          } else {
            // Set mouse start for the clicked object only (if it's a node)
            if (
              clickedObject &&
              clickedObject instanceof Node &&
              clickedObject.setMouseStart
            ) {
              clickedObject.setMouseStart(x, y);
            }
          }
        }
      } else if (shiftPressed) {
        // Start creating temporary link
        const tempLink = new TemporaryLink({ x, y }, { x, y });
        setCurrentLink(tempLink);
      } else {
        // Clicked on empty area
        // Selection is already handled in the selection logic above
        // If we still have a selection after the selection logic, we can start moving
        if (
          selectedObject &&
          Array.isArray(selectedObject) &&
          selectedObject.length > 0
        ) {
          setMovingObject(true);
          // Set mouse start for all selected objects (only nodes)
          selectedObject.forEach((obj) => {
            if (obj && obj instanceof Node && obj.setMouseStart) {
              obj.setMouseStart(x, y);
            }
          });
        }
      }

      draw();
    },
    [
      selectObjectAtPoint,
      selectObject,
      selectedObject,
      shiftPressed,
      setCurrentLink,
      setMovingObject,
      setDraggedHandle,
      draw,
      getMouseCoordinates,
    ]
  );

  const handleDoubleClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { x, y } = getMouseCoordinates(e);

      const clickedObject = selectObjectAtPoint(x, y);

      if (!clickedObject) {
        // Save history before creating new node
        saveHistory();
        // Create new node
        const newNode = new Node(x, y);
        newNode.id = `node_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        addNode(newNode);
        selectObject(newNode);
      } else if (clickedObject instanceof Node) {
        // Save history before toggling accept state
        saveHistory();
        // Toggle accept state
        updateNode(clickedObject, {
          isAcceptState: !clickedObject.isAcceptState,
        });
      }

      draw();
    },
    [
      selectObjectAtPoint,
      saveHistory,
      addNode,
      selectObject,
      updateNode,
      draw,
      getMouseCoordinates,
      spacePressed,
      setPanning,
    ]
  );

  const handleMouseMove = useCallback(
    (e) => {
      // Handle panning first - this works anywhere in the container
      if (isPanning) {
        const deltaX = e.movementX;
        const deltaY = e.movementY;
        setPan(panX + deltaX * zoom, panY + deltaY * zoom);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const { x, y } = getMouseCoordinates(e);

      if (currentLink) {
        const targetNode = selectObjectAtPoint(x, y);
        const targetNodeInstance =
          targetNode instanceof Node ? targetNode : null;

        if (!selectedObject) {
          // Always use TemporaryLink when drawing from nothing to maintain arrow visibility
          // Keep the original starting position from currentLink.from
          const tempLink = new TemporaryLink(currentLink.from, { x, y });
          setCurrentLink(tempLink);
        } else if (selectedObject instanceof Node) {
          // During drag operation from a selected node, always use TemporaryLink to show arrow properly
          // Check if cursor is near any node for snapping (including the same node for self-links)
          let endPoint = { x, y };
          let snapDistance = nodeRadius + 20; // Snap within 20 pixels of node edge

          // Find the closest node within snap distance (including the same node)
          let closestNode = null;
          let closestDistance = Infinity;

          nodes.forEach((node) => {
            const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            if (distance < closestDistance && distance <= snapDistance) {
              closestDistance = distance;
              closestNode = node;
            }
          });

          if (closestNode) {
            // Snap to the closest point on the target node's circle
            endPoint = closestNode.closestPointOnCircle(x, y, nodeRadius);
            setSnappedNode(closestNode);
          } else {
            setSnappedNode(null);
          }

          const tempLink = new TemporaryLink(
            selectedObject.closestPointOnCircle(x, y, nodeRadius),
            endPoint
          );
          setCurrentLink(tempLink);
        }
        draw();
      }

      if (movingObject && selectedObject) {
        if (Array.isArray(selectedObject)) {
          // Move all selected objects (only nodes, links will follow automatically)
          selectedObject.forEach((obj) => {
            if (obj instanceof Node) {
              // Only move nodes, not links
              if (obj.setAnchorPoint) {
                obj.setAnchorPoint(x, y);
              }
              snapNode(obj);
            }
            // Skip links - they will automatically adjust based on their connected nodes
          });
        } else {
          // Move single selected object
          if (selectedObject instanceof Node) {
            // Only move nodes, not links
            if (selectedObject.setAnchorPoint) {
              selectedObject.setAnchorPoint(x, y);
            }
            snapNode(selectedObject);
          }
          // Skip links - they will automatically adjust based on their connected nodes
        }
        draw();
      }

      // Handle direct link dragging
      if (
        draggedHandle === "direct" &&
        selectedObject &&
        (selectedObject instanceof StandaloneArrow ||
          selectedObject instanceof SelfLink ||
          selectedObject instanceof Link ||
          selectedObject instanceof StartLink)
      ) {
        if (selectedObject instanceof StandaloneArrow) {
          // For standalone arrows, adjust the end point
          selectedObject.endX = x;
          selectedObject.endY = y;
        } else if (selectedObject instanceof SelfLink) {
          // For self-links, adjust the anchor angle
          const dx = x - selectedObject.node.x;
          const dy = y - selectedObject.node.y;
          selectedObject.anchorAngle = Math.atan2(dy, dx);
        } else if (selectedObject instanceof Link) {
          // For regular links, adjust the curve using the existing setAnchorPoint method
          selectedObject.setAnchorPoint(x, y);
        } else if (selectedObject instanceof StartLink) {
          // For start links, adjust the starting point using the existing setAnchorPoint method
          selectedObject.setAnchorPoint(x, y, 6); // 6 is the snapToPadding
        }
        draw();
      }
    },
    [
      currentLink,
      selectedObject,
      selectObjectAtPoint,
      setCurrentLink,
      movingObject,
      snapNode,
      draggedHandle,
      nodes,
      nodeRadius,
      draw,
      getMouseCoordinates,
      isPanning,
      panX,
      panY,
      setPan,
    ]
  );

  const handleMouseUp = useCallback(
    (e) => {
      // Prevent event bubbling to avoid duplicate link creation
      if (e.target === canvasRef.current) {
        e.stopPropagation();
      }

      setMovingObject(false);
      setPanning(false);
      setSnappedNode(null); // Clear snapped node on mouse up

      // Handle direct link dragging completion
      if (
        draggedHandle === "direct" &&
        selectedObject &&
        (selectedObject instanceof StandaloneArrow ||
          selectedObject instanceof SelfLink ||
          selectedObject instanceof Link ||
          selectedObject instanceof StartLink)
      ) {
        // Handle dragging complete
        setDraggedHandle(null);
        saveHistory(); // Save the state after link modification
        return; // Don't process other mouse up logic
      }

      if (currentLink && currentLink instanceof TemporaryLink) {
        // Get the final mouse position to determine what type of link to create
        const { x, y } = getMouseCoordinates(e);

        // Use the same snapping logic as in handleMouseMove
        let targetNodeInstance = null;
        let snapDistance = nodeRadius + 20; // Snap within 20 pixels of node edge

        // Find the closest node within snap distance
        let closestDistance = Infinity;

        nodes.forEach((node) => {
          const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
          if (distance < closestDistance && distance <= snapDistance) {
            closestDistance = distance;
            targetNodeInstance = node;
          }
        });

        if (targetNodeInstance) {
          if (selectedObject && targetNodeInstance === selectedObject) {
            // Create self-link using the snapped position from currentLink
            saveHistory();
            const selfLink = new SelfLink(selectedObject, currentLink.to);
            selfLink.id = `link_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`;
            addLink(selfLink);
            selectObject(selfLink);
            clearCurrentLink(); // Clear after successful creation
          } else if (selectedObject) {
            // Create regular link from selected object to target
            saveHistory();
            const link = new Link(selectedObject, targetNodeInstance);
            link.id = `link_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`;
            addLink(link);
            selectObject(link);
            clearCurrentLink(); // Clear after successful creation
          } else {
            // Drawing from nothing to a target - create a start link
            saveHistory();
            const startLink = new StartLink(
              targetNodeInstance,
              currentLink.from
            );
            startLink.id = `link_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`;
            addLink(startLink);
            selectObject(startLink);
            clearCurrentLink(); // Clear after successful creation
          }
        } else if (!selectedObject) {
          // Drawing from nothing to nothing - create a standalone arrow
          saveHistory();
          const standaloneArrow = new StandaloneArrow(
            currentLink.from.x,
            currentLink.from.y,
            x,
            y
          );
          standaloneArrow.id = `link_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          addLink(standaloneArrow);
          selectObject(standaloneArrow);
          clearCurrentLink(); // Clear after successful creation
        }
      } else if (currentLink && !(currentLink instanceof TemporaryLink)) {
        saveHistory();
        addLink(currentLink);
        selectObject(currentLink);
        clearCurrentLink(); // Clear after successful creation
      }
      setSnappedNode(null); // Clear snapped node when link is cleared
      draw();
    },
    [
      currentLink,
      addLink,
      addNode,
      selectObject,
      setMovingObject,
      setPanning,
      clearCurrentLink,
      draw,
      selectObjectAtPoint,
      draggedHandle,
      selectedObject,
      saveHistory,
      setDraggedHandle,
      nodeRadius,
      canvasRef,
    ]
  );

  // Text paste handler
  const handleTextPaste = useCallback(async () => {
    if (
      !selectedObject ||
      Array.isArray(selectedObject) ||
      !("text" in selectedObject)
    )
      return;

    try {
      // Get text from clipboard
      const clipboardText = await navigator.clipboard.readText();

      // Append the pasted text to the selected object's text
      selectedObject.text += clipboardText;

      // Redraw the canvas
      draw();

      // Save history
      saveHistory();
    } catch (error) {
      console.warn("Failed to read from clipboard:", error);
      // Fallback: try to get text from a temporary textarea
      const textarea = document.createElement("textarea");
      textarea.style.position = "fixed";
      textarea.style.left = "-999999px";
      textarea.style.top = "-999999px";
      document.body.appendChild(textarea);
      textarea.focus();

      try {
        document.execCommand("paste");
        const pastedText = textarea.value;
        if (pastedText) {
          selectedObject.text += pastedText;
          draw();
          saveHistory();
        }
      } catch (fallbackError) {
        console.warn("Fallback paste also failed:", fallbackError);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }, [selectedObject, draw, saveHistory]);

  // Keyboard event handlers
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Shift") {
        // Handle shift key in context
        return;
      }

      if (e.target !== canvasRef.current && e.target !== document.body) {
        return; // Don't handle keys when other elements have focus
      }

      // Handle undo/redo shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          undo();
          e.preventDefault();
          return;
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          redo();
          e.preventDefault();
          return;
        } else if (e.key === "c") {
          // Copy selected object
          copySelected();
          e.preventDefault();
          return;
        } else if (e.key === "v") {
          // Check if we should paste text or object
          if (
            selectedObject &&
            !Array.isArray(selectedObject) &&
            "text" in selectedObject
          ) {
            // Paste text into selected object
            handleTextPaste();
            e.preventDefault();
            return;
          } else {
            // Paste object from clipboard
            paste();
            e.preventDefault();
            return;
          }
        }
      }

      if (e.key === "Backspace") {
        if (
          selectedObject &&
          !Array.isArray(selectedObject) &&
          "text" in selectedObject
        ) {
          selectedObject.text = selectedObject.text.slice(0, -1);
          draw();
        }
        e.preventDefault();
      } else if (e.key === "Delete") {
        if (selectedObject) {
          // Save history before deleting
          saveHistory();
          if (Array.isArray(selectedObject)) {
            // Delete all selected objects
            selectedObject.forEach((obj) => {
              if (obj instanceof Node) {
                deleteNode(obj);
              } else {
                deleteLink(obj);
              }
            });
          } else {
            // Delete single selected object
            if (selectedObject instanceof Node) {
              deleteNode(selectedObject);
            } else {
              deleteLink(selectedObject);
            }
          }
          draw();
        }
      } else if (
        e.key.length === 1 &&
        !e.metaKey &&
        !e.altKey &&
        !e.ctrlKey &&
        selectedObject &&
        !Array.isArray(selectedObject) &&
        "text" in selectedObject
      ) {
        selectedObject.text += e.key;
        draw();
        e.preventDefault();
      }
    },
    [
      selectedObject,
      saveHistory,
      deleteNode,
      deleteLink,
      undo,
      redo,
      copySelected,
      paste,
      handleTextPaste,
      draw,
    ]
  );

  const handleKeyUp = useCallback((e) => {
    if (e.key === "Shift") {
      // Handle shift key release
    }
  }, []);

  // Effects
  useEffect(() => {
    updateCanvasSize();
    draw();
  }, [updateCanvasSize, draw]);

  // Canvas centering is now handled purely by CSS

  useEffect(() => {
    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCanvasSize]);

  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if (e.key === "Shift") {
        setShiftPressed(true);
      } else if (
        e.altKey ||
        e.key === "Alt" ||
        e.code === "AltLeft" ||
        e.code === "AltRight"
      ) {
        setAltPressed(true);
      } else if (e.key === " ") {
        e.preventDefault(); // Prevent page scroll
        setSpacePressed(true);
      }
    };

    const handleKeyUpGlobal = (e) => {
      if (e.key === "Shift") {
        setShiftPressed(false);
      } else if (
        e.altKey ||
        e.key === "Alt" ||
        e.code === "AltLeft" ||
        e.code === "AltRight"
      ) {
        setAltPressed(false);
      } else if (e.key === " ") {
        setSpacePressed(false);
        setPanning(false); // Stop panning when spacebar is released
      }
    };

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(zoom * delta);
      }
    };

    document.addEventListener("keydown", handleKeyDownGlobal);
    document.addEventListener("keyup", handleKeyUpGlobal);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDownGlobal);
      document.removeEventListener("keyup", handleKeyUpGlobal);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [
    handleKeyDown,
    handleKeyUp,
    setShiftPressed,
    setAltPressed,
    setSpacePressed,
    setPanning,
    zoom,
    setZoom,
  ]);

  // Listen for zoom keyboard shortcut events
  useEffect(() => {
    const handleZoomInEvent = () => {
      setZoom(zoom * 1.2);
    };

    const handleZoomOutEvent = () => {
      setZoom(zoom / 1.2);
    };

    const handleResetZoomEvent = () => {
      resetZoom();
    };

    window.addEventListener("zoomIn", handleZoomInEvent);
    window.addEventListener("zoomOut", handleZoomOutEvent);
    window.addEventListener("resetZoom", handleResetZoomEvent);

    return () => {
      window.removeEventListener("zoomIn", handleZoomInEvent);
      window.removeEventListener("zoomOut", handleZoomOutEvent);
      window.removeEventListener("resetZoom", handleResetZoomEvent);
    };
  }, [zoom, setZoom, resetZoom]);

  return (
    <main
      className={`canvas-container ${
        spacePressed ? "pan-mode" : ""
      } canvas-size-${diagramCanvasSize}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        style={{
          transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`,
          transformOrigin: "center center",
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        tabIndex={0}
      >
        <span className="error">
          Your browser does not support
          <br />
          the HTML5 &lt;canvas&gt; element
        </span>
      </canvas>
      <OperationAlerts />

      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button
          className="zoom-btn zoom-in"
          onClick={() => setZoom(zoom * 1.2)}
          data-tooltip-id="zoom-in-tooltip"
          data-tooltip-content={`Zoom In (${SHORTCUTS.ZOOM_IN})`}
        >
          <i className="fas fa-plus"></i>
        </button>
        <div className="zoom-level">{Math.round(zoom * 100)}%</div>
        <button
          className="zoom-btn zoom-out"
          onClick={() => setZoom(zoom / 1.2)}
          data-tooltip-id="zoom-out-tooltip"
          data-tooltip-content={`Zoom Out (${SHORTCUTS.ZOOM_OUT})`}
        >
          <i className="fas fa-minus"></i>
        </button>
        <button
          className="zoom-btn zoom-reset"
          onClick={resetZoom}
          data-tooltip-id="zoom-reset-tooltip"
          data-tooltip-content={`Reset Zoom (${SHORTCUTS.ZOOM_RESET})`}
        >
          <i className="fas fa-expand-arrows-alt"></i>
        </button>
        <div
          className={`pan-indicator ${spacePressed ? "active" : ""}`}
          data-tooltip-id="pan-tool-tooltip"
          data-tooltip-content="Hold space+drag"
        >
          <i className="fas fa-hand-paper"></i>
        </div>
        <button
          className="zoom-btn canvas-help"
          onClick={() => setCanvasWalkthroughOpen(true)}
          data-tooltip-id="canvas-help-tooltip"
          data-tooltip-content="Canvas Walkthrough"
        >
          <i className="fas fa-question-circle"></i>
        </button>
      </div>

      {isSidebarCollapsed && (
        <button
          className="floating-sidebar-toggle"
          onClick={toggleSidebar}
          data-tooltip-id="floating-sidebar-tooltip"
          data-tooltip-content={`Show Sidebar (${SHORTCUTS.TOGGLE_SIDEBAR})`}
        >
          <i className="fas fa-bars floating-toggle-icon"></i>
        </button>
      )}

      {/* Tooltip components */}
      <Tooltip
        id="floating-sidebar-tooltip"
        place="right"
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#111827" : "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="zoom-in-tooltip"
        place="left"
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#111827" : "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="zoom-out-tooltip"
        place="left"
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#111827" : "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="zoom-reset-tooltip"
        place="left"
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#111827" : "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="pan-tool-tooltip"
        place="left"
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#111827" : "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />
      <Tooltip
        id="canvas-help-tooltip"
        place="left"
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#111827" : "#1f2937",
          color: "white",
          borderRadius: "6px",
          fontSize: "12px",
          padding: "6px 8px",
        }}
      />

      {canvasWalkthroughOpen &&
        createPortal(
          <CanvasWalkthroughModal
            isOpen={canvasWalkthroughOpen}
            onClose={() => {
              setCanvasWalkthroughOpen(false);
              localStorage.setItem("canvas-walkthrough-shown", "true");
            }}
          />,
          document.body
        )}
    </main>
  );
};

export default Canvas;
